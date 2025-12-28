import { useState } from 'react';
import { callBackend } from '../api';

export const useNavigationStack = (currentUserId, setActiveTab) => {
    const [loading, setLoading] = useState(false);

    // When user clicks a link normally
    const pushNav = async (tab) => {
        if (!currentUserId) return;
        await callBackend('nav_push', [currentUserId, tab]);
        setActiveTab(tab);
    };

    // When user hits the Undo (Back) button
    const undo = async () => {
        setLoading(true);
        const res = await callBackend('nav_back', [currentUserId]);
        if (res && res.tab) setActiveTab(res.tab);
        setLoading(false);
    };

    // When user hits the Redo (Forward) button
    const redo = async () => {
        setLoading(true);
        const res = await callBackend('nav_forward', [currentUserId]);
        if (res && res.tab) setActiveTab(res.tab);
        setLoading(false);
    };

    return { pushNav, undo, redo, loading };
};