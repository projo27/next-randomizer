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
} from "@/services/user-preferences";
import { triggerList as defaultMenuData } from "@/lib/menu-data";

// Type for a single menu item definition
export type MenuItemData = typeof defaultMenuData[0];

// Type for the context
interface MenuOrderContextType {
  menuOrder: MenuItemData[];
  setMenuOrder: (newOrder: MenuItemData[]) => void;
  loading: boolean;
}

// Get the default order from the menu data file
const defaultOrder = defaultMenuData.map(item => item.value);

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
  const [menuOrder, setMenuOrderState] = useState<MenuItemData[]>(defaultMenuData);
  const [loading, setLoading] = useState(true);

  // Function to sort the full menu data based on an array of keys
  const sortMenuData = (orderKeys: string[]): MenuItemData[] => {
    const orderedData = [...defaultMenuData].sort((a, b) => {
        const indexA = orderKeys.indexOf(a.value);
        const indexB = orderKeys.indexOf(b.value);
        // If an item is not in the orderKeys (new item), place it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // Add any new items from defaultMenuData that are not in the saved order
    const existingKeys = new Set(orderedData.map(item => item.value));
    const newItems = defaultMenuData.filter(item => !existingKeys.has(item.value));
    
    return [...orderedData, ...newItems];
  };

  useEffect(() => {
    async function fetchMenuOrder() {
      setLoading(true);
      if (user) {
        // User is logged in, fetch their saved order
        const savedOrderKeys = await getMenuOrder(user.uid);
        if (savedOrderKeys && savedOrderKeys.length > 0) {
          setMenuOrderState(sortMenuData(savedOrderKeys));
        } else {
          // No saved order, use default
          setMenuOrderState(sortMenuData(defaultOrder));
        }
      } else {
        // User is not logged in, use default order
        setMenuOrderState(sortMenuData(defaultOrder));
      }
      setLoading(false);
    }

    // Run fetch only when auth loading is finished
    if (!authLoading) {
      fetchMenuOrder();
    }
  }, [user, authLoading]);

  const setMenuOrder = useCallback(
    (newOrder: MenuItemData[]) => {
      // Update local state immediately for responsive UI
      setMenuOrderState(newOrder);
      // If user is logged in, save the new order to Firestore
      if (user) {
        const orderKeys = newOrder.map((item) => item.value);
        saveMenuOrder(user.uid, orderKeys);
      }
    },
    [user],
  );

  const value = {
    menuOrder,
    setMenuOrder,
    loading: authLoading || loading,
  };

  return (
    <MenuOrderContext.Provider value={value}>
      {children}
    </MenuOrderContext.Provider>
  );
}
