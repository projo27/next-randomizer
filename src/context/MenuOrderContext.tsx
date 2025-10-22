
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
import { triggerList as allMenuItems } from "@/lib/menu-data";

// Type for a single menu item definition
export type MenuItemData = typeof allMenuItems[0];

// Type for the context
interface MenuOrderContextType {
  menuOrder: MenuOrder;
  setMenuOrder: (newOrder: MenuOrder) => void;
  loading: boolean;
}

// Get the default order from the menu data file
const defaultVisibleOrderKeys = allMenuItems
  .filter((item, index) => index < 10 && !item.hidden) // Default to first 10 visible items
  .map((item) => item.value);

const defaultHiddenOrderKeys = allMenuItems
  .filter((item) => !defaultVisibleOrderKeys.includes(item.value) && !item.hidden)
  .map((item) => item.value);

const defaultOrder: MenuOrder = {
  visible: defaultVisibleOrderKeys,
  hidden: defaultHiddenOrderKeys,
};


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
  const [menuOrder, setMenuOrderState] = useState<MenuOrder>(defaultOrder);
  const [loading, setLoading] = useState(true);

  // Function to sort the full menu data based on an array of keys
  const getItemsFromKeys = (keys: string[]): MenuItemData[] => {
    return keys
      .map(key => allMenuItems.find(item => item.value === key))
      .filter((item): item is MenuItemData => !!item);
  };

  useEffect(() => {
    async function fetchMenuOrder() {
      setLoading(true);
      if (user) {
        const savedOrder = await getMenuOrder(user.uid);
        if (savedOrder) {
            // Ensure all items exist in one of the lists
            const allSavedKeys = new Set([...savedOrder.visible, ...savedOrder.hidden]);
            const newItems = allMenuItems.filter(item => !allSavedKeys.has(item.value) && !item.hidden);
            // Add new items to the hidden list by default
            if (newItems.length > 0) {
              savedOrder.hidden.push(...newItems.map(item => item.value));
            }
            setMenuOrderState(savedOrder);
        } else {
          setMenuOrderState(defaultOrder);
        }
      } else {
        setMenuOrderState(defaultOrder);
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchMenuOrder();
    }
  }, [user, authLoading]);

  const setMenuOrder = useCallback(
    (newOrder: MenuOrder) => {
      // Update local state immediately for responsive UI
      setMenuOrderState(newOrder);
      // If user is logged in, save the new order to Firestore
      if (user) {
        saveMenuOrder(user.uid, newOrder);
      }
    },
    [user],
  );

  const value = {
    menuOrder: {
        visible: getItemsFromKeys(menuOrder.visible),
        hidden: getItemsFromKeys(menuOrder.hidden),
    },
    setMenuOrder: (newOrder: { visible: MenuItemData[], hidden: MenuItemData[] }) => {
        setMenuOrder({
            visible: newOrder.visible.map(item => item.value),
            hidden: newOrder.hidden.map(item => item.value),
        })
    },
    loading: authLoading || loading,
  };

  // The context now provides MenuItemData arrays, but internally manages string keys
  const contextValue: MenuOrderContextType = {
      menuOrder: {
          visible: getItemsFromKeys(menuOrder.visible),
          hidden: getItemsFromKeys(menuOrder.hidden),
      },
      setMenuOrder: (newOrder: { visible: MenuItemData[], hidden: MenuItemData[] }) => {
        const newOrderKeys: MenuOrder = {
          visible: newOrder.visible.map(item => item.value),
          hidden: newOrder.hidden.map(item => item.value),
        };
        setMenuOrder(newOrderKeys);
      },
      loading: authLoading || loading,
  };


  return (
    <MenuOrderContext.Provider value={contextValue}>
      {children}
    </MenuOrderContext.Provider>
  );
}
