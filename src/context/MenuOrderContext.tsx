// src/context/MenuOrderContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getMenuOrder,
  saveMenuOrder,
  MenuOrder,
} from "@/services/user-preferences";
import { triggerList as allMenuItems, MenuItemData } from "@/lib/menu-data";
import { useSettings } from "./SettingsContext";

// Type for the context
interface MenuOrderContextType {
  menuOrder: {
    visible: MenuItemData[];
    hidden: MenuItemData[];
  };
  setMenuOrder: (newOrder: {
    visible: MenuItemData[];
    hidden: MenuItemData[];
  }) => void;
  resetMenuOrder: () => void;
  loading: boolean;
}

const MenuOrderContext = createContext<MenuOrderContextType | undefined>(
  undefined,
);

export function useMenuOrder() {
  const context = useContext(MenuOrderContext);
  if (!context) {
    throw new Error("useMenuOrder must be used within a MenuOrderProvider");
  }
  return context;
}

export function MenuOrderProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { visibleToolCount, loading: settingsLoading } = useSettings();

  // Initialize with default order immediately to prevent blocking UI
  const [menuOrderKeys, setMenuOrderKeys] = useState<MenuOrder>(() => {
    const defaultCount = visibleToolCount;
    const allVisibleMenuItems = allMenuItems.filter(item => !item.hidden);
    const visibleKeys = allVisibleMenuItems.slice(0, defaultCount).map(item => item.value);
    const hiddenKeys = allVisibleMenuItems.slice(defaultCount).map(item => item.value);
    return { visible: visibleKeys, hidden: hiddenKeys };
  });

  const [loading, setLoading] = useState(true);

  // Function to sort the full menu data based on an array of keys
  const getItemsFromKeys = (keys: string[]): MenuItemData[] => {
    return keys
      .map(key => allMenuItems.find(item => item.value === key))
      .filter((item): item is MenuItemData => !!item);
  };

  const generateDefaultOrder = useCallback(() => {
    const count = visibleToolCount;
    const allVisibleMenuItems = allMenuItems.filter(item => !item.hidden);
    const visibleKeys = allVisibleMenuItems.slice(0, count).map(item => item.value);
    const hiddenKeys = allVisibleMenuItems.slice(count).map(item => item.value);
    return { visible: visibleKeys, hidden: hiddenKeys };
  }, [visibleToolCount]);

  // Helper to merge/validate keys
  const validateAndMergeKeys = useCallback((order: MenuOrder) => {
    const allCurrentKeys = new Set(allMenuItems.map(i => i.value));
    const allSavedKeys = new Set([...order.visible, ...order.hidden]);

    const newItems = allMenuItems.filter(item => !allSavedKeys.has(item.value) && !item.hidden);

    if (newItems.length > 0) {
      order.hidden.push(...newItems.map(item => item.value));
    }
    // Remove keys that no longer exist
    order.visible = order.visible.filter(key => allCurrentKeys.has(key));
    order.hidden = order.hidden.filter(key => allCurrentKeys.has(key));
    return order;
  }, []);

  useEffect(() => {
    async function fetchMenuOrder() {
      // If we are still waiting for auth or settings, don't do the full sync yet
      // but we already have a default state so UI is visible.
      if (authLoading || settingsLoading) return;

      let isLocalLoaded = false;

      if (user) {
        // 1. Try Local Storage
        try {
          const localKey = `menu_order_${user.uid}`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            let parsedOrder = JSON.parse(localData);
            parsedOrder = validateAndMergeKeys(parsedOrder);
            setMenuOrderKeys(parsedOrder);
            isLocalLoaded = true;
          }
        } catch (e) {
          console.error("Error reading local storage", e);
        }

        // 2. Fetch from Firebase (Background update)
        try {
          let savedOrder = await getMenuOrder(user.uid);

          if (savedOrder) {
            savedOrder = validateAndMergeKeys(savedOrder);
            setMenuOrderKeys(savedOrder);
            localStorage.setItem(`menu_order_${user.uid}`, JSON.stringify(savedOrder));
          } else {
            // If no data in firebase and NO local data, we might want to ensure 
            // we are using the correct default based on the now-loaded settings
            if (!isLocalLoaded) {
              setMenuOrderKeys(generateDefaultOrder());
            }
          }
        } catch (error) {
          console.error("Error fetching menu order", error);
        }
      } else {
        // No user, just ensure we respect the settings for default order
        setMenuOrderKeys(generateDefaultOrder());
      }

      setLoading(false);
    }

    fetchMenuOrder();
  }, [user, authLoading, settingsLoading, generateDefaultOrder, validateAndMergeKeys]);

  const handleSetMenuOrder = useCallback(
    (newOrder: { visible: MenuItemData[]; hidden: MenuItemData[] }) => {
      const newOrderKeys: MenuOrder = {
        visible: newOrder.visible.map(item => item.value),
        hidden: newOrder.hidden.map(item => item.value),
      };

      // Update local state immediately for responsive UI
      setMenuOrderKeys(newOrderKeys);

      if (user) {
        localStorage.setItem(`menu_order_${user.uid}`, JSON.stringify(newOrderKeys));
        saveMenuOrder(user.uid, newOrderKeys);
      }
    },
    [user],
  );

  const resetMenuOrder = useCallback(() => {
    const defaultOrder = generateDefaultOrder();
    setMenuOrderKeys(defaultOrder);

    if (user) {
      localStorage.setItem(`menu_order_${user.uid}`, JSON.stringify(defaultOrder));
      saveMenuOrder(user.uid, defaultOrder);
    }
  }, [user, generateDefaultOrder]);

  // The context now provides MenuItemData arrays, but internally manages string keys
  const contextValue: MenuOrderContextType = {
    menuOrder: {
      visible: getItemsFromKeys(menuOrderKeys.visible),
      hidden: getItemsFromKeys(menuOrderKeys.hidden),
    },
    setMenuOrder: handleSetMenuOrder,
    resetMenuOrder,
    loading: loading, // This now represents "syncing" status
  };

  return (
    <MenuOrderContext.Provider value={contextValue}>
      {children}
    </MenuOrderContext.Provider>
  );
}
