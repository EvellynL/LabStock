import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Item, Category, LabLocation, Movement, MovementType } from '../types/inventory';
import { DEFAULT_ITEMS, DEFAULT_CATEGORIES, DEFAULT_LOCATIONS, DEFAULT_MOVEMENTS } from '../data/mockData';
import { generateItemId, generateMovementId } from '../utils/formatters';

interface InventoryContextType {
  items: Item[];
  categories: Category[];
  locations: LabLocation[];
  movements: Movement[];
  getItem: (id: string) => Item | undefined;
  addItem: (itemData: Omit<Item, 'id' | 'dataCadastro' | 'dataUltimaAtualizacao'>) => Item;
  updateItem: (id: string, updates: Partial<Item>) => boolean;
  deleteItem: (id: string) => boolean;
  registerMovement: (params: {
    itemId: string;
    tipo: MovementType;
    quantidade: number;
    motivo: string;
    responsavel?: string;
  }) => { success: boolean; message: string };
  addCategory: (categoryData: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => boolean;
  deleteCategory: (id: string) => { success: boolean; message?: string };
  addLocation: (locationData: Omit<LabLocation, 'id'>) => LabLocation;
  updateLocation: (id: string, updates: Partial<LabLocation>) => boolean;
  deleteLocation: (id: string) => boolean;
  clearInventoryAndMovements: () => void;
  // Computed helpers
  lowStockItems: Item[];
  totalItemsCount: number;
  totalCategoriesCount: number;
  totalInventoryValue: number;
}

const STORAGE_KEYS = {
  ITEMS: 'labstock_items_clean_v2',
  CATEGORIES: 'labstock_categories_clean_v2',
  LOCATIONS: 'labstock_locations_clean_v2',
  MOVEMENTS: 'labstock_movements_clean_v2',
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or use defaults (empty items and empty movements)
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load items from storage', e);
    }
    return DEFAULT_ITEMS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load categories from storage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [locations, setLocations] = useState<LabLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load locations from storage', e);
    }
    return DEFAULT_LOCATIONS;
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load movements from storage', e);
    }
    return DEFAULT_MOVEMENTS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  // Helpers
  const getItem = (id: string): Item | undefined => {
    return items.find((i) => i.id === id);
  };

  const addItem = (itemData: Omit<Item, 'id' | 'dataCadastro' | 'dataUltimaAtualizacao'>): Item => {
    const now = new Date().toISOString();
    const newId = generateItemId(items);

    const newItem: Item = {
      ...itemData,
      id: newId,
      dataCadastro: now,
      dataUltimaAtualizacao: now,
    };

    setItems((prev) => [newItem, ...prev]);

    // If initial stock > 0, automatically register initial entry movement
    if (newItem.quantidadeAtual > 0) {
      const initMovement: Movement = {
        id: generateMovementId(),
        itemId: newItem.id,
        itemNome: newItem.nome,
        itemCategoria: newItem.categoria,
        tipo: 'entrada',
        quantidade: newItem.quantidadeAtual,
        quantidadeAnterior: 0,
        quantidadeApos: newItem.quantidadeAtual,
        motivo: 'Cadastro inicial de item no estoque',
        responsavel: 'Sistema',
        data: now,
      };
      setMovements((prev) => [initMovement, ...prev]);
    }

    return newItem;
  };

  const updateItem = (id: string, updates: Partial<Item>): boolean => {
    let updated = false;
    const now = new Date().toISOString();

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updated = true;
          return {
            ...item,
            ...updates,
            id: item.id, // Preserve ID
            dataUltimaAtualizacao: now,
          };
        }
        return item;
      })
    );

    return updated;
  };

  const deleteItem = (id: string): boolean => {
    const item = getItem(id);
    if (!item) return false;

    setItems((prev) => prev.filter((i) => i.id !== id));
    return true;
  };

  const registerMovement = (params: {
    itemId: string;
    tipo: MovementType;
    quantidade: number;
    motivo: string;
    responsavel?: string;
  }): { success: boolean; message: string } => {
    const item = getItem(params.itemId);
    if (!item) {
      return { success: false, message: 'Item não encontrado no sistema.' };
    }

    if (params.quantidade <= 0) {
      return { success: false, message: 'A quantidade deve ser maior que zero.' };
    }

    const anterior = item.quantidadeAtual;
    let novaQtd = anterior;

    if (params.tipo === 'entrada') {
      novaQtd = anterior + params.quantidade;
    } else if (params.tipo === 'saida') {
      if (params.quantidade > anterior) {
        return {
          success: false,
          message: `Quantidade solicitada (${params.quantidade} ${item.unidadeMedida}) é maior que o estoque atual disponível (${anterior} ${item.unidadeMedida}).`,
        };
      }
      novaQtd = anterior - params.quantidade;
    } else if (params.tipo === 'ajuste') {
      novaQtd = params.quantidade; // In adjustment, quantity is the new balance
    }

    const now = new Date().toISOString();
    const newMov: Movement = {
      id: generateMovementId(),
      itemId: item.id,
      itemNome: item.nome,
      itemCategoria: item.categoria,
      tipo: params.tipo,
      quantidade: params.quantidade,
      quantidadeAnterior: anterior,
      quantidadeApos: novaQtd,
      motivo: params.motivo,
      responsavel: params.responsavel || 'Usuário Lab',
      data: now,
    };

    // Update item stock
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantidadeAtual: novaQtd, dataUltimaAtualizacao: now } : i))
    );

    // Record movement
    setMovements((prev) => [newMov, ...prev]);

    return {
      success: true,
      message: `Movimentação registrada com sucesso! Novo saldo: ${novaQtd} ${item.unidadeMedida}.`,
    };
  };

  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>): boolean => {
    let updated = false;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          updated = true;
          return { ...cat, ...updates };
        }
        return cat;
      })
    );
    return updated;
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Categoria não encontrada.' };

    const itemsUsingCategory = items.filter((i) => i.categoria === target.nome);
    if (itemsUsingCategory.length > 0) {
      return {
        success: false,
        message: `Não é possível excluir a categoria "${target.nome}" pois existem ${itemsUsingCategory.length} itens vinculados a ela.`,
      };
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  const addLocation = (locationData: Omit<LabLocation, 'id'>): LabLocation => {
    const newLoc: LabLocation = {
      ...locationData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id: string, updates: Partial<LabLocation>): boolean => {
    let updated = false;
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === id) {
          updated = true;
          return { ...loc, ...updates };
        }
        return loc;
      })
    );
    return updated;
  };

  const deleteLocation = (id: string): boolean => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    return true;
  };

  const clearInventoryAndMovements = () => {
    setItems([]);
    setMovements([]);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
  };

  // Computed values
  const lowStockItems = useMemo(() => {
    return items.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);
  }, [items]);

  const totalItemsCount = items.length;
  const totalCategoriesCount = categories.length;

  const totalInventoryValue = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.precoUnitario || 0) * item.quantidadeAtual, 0);
  }, [items]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        categories,
        locations,
        movements,
        getItem,
        addItem,
        updateItem,
        deleteItem,
        registerMovement,
        addCategory,
        updateCategory,
        deleteCategory,
        addLocation,
        updateLocation,
        deleteLocation,
        clearInventoryAndMovements,
        lowStockItems,
        totalItemsCount,
        totalCategoriesCount,
        totalInventoryValue,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
