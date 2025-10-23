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
  const [menuOrderKeys, setMenuOrderKeys] = useState<MenuOrder>({ visible: [], hidden: [] });
  const [loading, setLoading] = useState(true);

  // Function to sort the full menu data based on an array of keys
  const getItemsFromKeys = (keys: string[]): MenuItemData[] => {
    return keys
      .map(key => allMenuItems.find(item => item.value === key))
      .filter((item): item is MenuItemData => !!item);
  };
  
  const generateDefaultOrder = useCallback(() => {
    const allVisibleMenuItems = allMenuItems.filter(item => !item.hidden);
    const visibleKeys = allVisibleMenuItems.slice(0, visibleToolCount).map(item => item.value);
    const hiddenKeys = allVisibleMenuItems.slice(visibleToolCount).map(item => item.value);
    return { visible: visibleKeys, hidden: hiddenKeys };
  }, [visibleToolCount]);


  useEffect(() => {
    async function fetchMenuOrder() {
      setLoading(true);
      if (user) {
        let savedOrder = await getMenuOrder(user.uid);
        
        // Ensure all menu items exist in the order, add new ones to hidden
        const allCurrentKeys = new Set(allMenuItems.map(i => i.value));
        const allSavedKeys = new Set(savedOrder ? [...savedOrder.visible, ...savedOrder.hidden] : []);
        
        const newItems = allMenuItems.filter(item => !allSavedKeys.has(item.value) && !item.hidden);
        
        if (savedOrder) {
          if (newItems.length > 0) {
            savedOrder.hidden.push(...newItems.map(item => item.value));
          }
          // Remove keys that no longer exist
          savedOrder.visible = savedOrder.visible.filter(key => allCurrentKeys.has(key));
          savedOrder.hidden = savedOrder.hidden.filter(key => allCurrentKeys.has(key));
          
          setMenuOrderKeys(savedOrder);
        } else {
          setMenuOrderKeys(generateDefaultOrder());
        }
      } else {
        setMenuOrderKeys(generateDefaultOrder());
      }
      setLoading(false);
    }

    if (!authLoading && !settingsLoading) {
      fetchMenuOrder();
    }
  }, [user, authLoading, settingsLoading, generateDefaultOrder]);

  const handleSetMenuOrder = useCallback(
    (newOrder: { visible: MenuItemData[]; hidden: MenuItemData[] }) => {
      const newOrderKeys: MenuOrder = {
        visible: newOrder.visible.map(item => item.value),
        hidden: newOrder.hidden.map(item => item.value),
      };
      
      // Update local state immediately for responsive UI
      setMenuOrderKeys(newOrderKeys);
      // If user is logged in, save the new order to Firestore
      if (user) {
        saveMenuOrder(user.uid, newOrderKeys);
      }
    },
    [user],
  );

  // The context now provides MenuItemData arrays, but internally manages string keys
  const contextValue: MenuOrderContextType = {
      menuOrder: {
          visible: getItemsFromKeys(menuOrderKeys.visible),
          hidden: getItemsFromKeys(menuOrderKeys.hidden),
      },
      setMenuOrder: handleSetMenuOrder,
      loading: authLoading || loading || settingsLoading,
  };


  return (
    <MenuOrderContext.Provider value={contextValue}>
      {children}
    </MenuOrderContext.Provider>
  );
}
