'use client';

import { useEffect } from 'react';
import { initStorage } from '../lib/initStorage';

export default function StorageInitializer() {
  useEffect(() => {
    initStorage();
  }, []);

  return null; // Dit component rendert niets
} 