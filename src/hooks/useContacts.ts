import { useState, useEffect } from 'react';

export interface TrustedContact {
    id: string;
    name: string;
    phone: string;
}

export const useContacts = () => {
    const [contacts, setContacts] = useState<TrustedContact[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('trusted_contacts');
        if (stored) {
            setContacts(JSON.parse(stored));
        }
    }, []);

    const addContact = (contact: Omit<TrustedContact, 'id'>) => {
        const newContact: TrustedContact = {
            id: Math.random().toString(36).substring(7),
            ...contact,
        };
        const updated = [...contacts, newContact];
        setContacts(updated);
        localStorage.setItem('trusted_contacts', JSON.stringify(updated));
    };

    const removeContact = (id: string) => {
        const updated = contacts.filter((c) => c.id !== id);
        setContacts(updated);
        localStorage.setItem('trusted_contacts', JSON.stringify(updated));
    };

    return { contacts, addContact, removeContact };
};
