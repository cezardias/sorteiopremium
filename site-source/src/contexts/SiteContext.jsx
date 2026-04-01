import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const SiteContext = createContext();

export const useSite = () => {
    return useContext(SiteContext);
};

export const SiteProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'PREMIUM MULTIMARCAS',
        whatsapp_number: '',
        instagram_link: '',
        helpdesk_url: '',
        email: '',
        logo_dark: '/assets/images/logos/logo.png',
        logo_light: '/assets/images/logos/logo.png',
        theme: 'dark',
        product_title: 'Sorteios Exclusivos',
        product_subtitle: 'Sua Sorte Começa Aqui.',
        footer_company: 'PREMIUM MULTIMARCAS',
        whatsapp_group_url: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/public-settings');
                if (response.data && response.data.success && response.data.data) {
                    const data = response.data.data;
                    setSettings({
                        site_name: data.site_name || 'PREMIUM MULTIMARCAS',
                        whatsapp_number: data.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}` : 'https://wa.me',
                        instagram_link: data.instagram_link || 'https://instagram.com',
                        helpdesk_url: data.helpdesk_url || '',
                        email: data.email || 'contato@premium.com',
                        theme: data.theme || 'dark',
                        logo_dark: data.logo_dark || data.logo || '/assets/images/logos/logo.png',
                        logo_light: data.logo_light || data.logo || '/assets/images/logos/logo.png',
                        product_title: data.product_title || 'Sorteio Premium MultiMarca',
                        product_subtitle: data.product_subtitle || 'Sua Sorte Começa Aqui.',
                        footer_company: data.footer_company || 'PREMIUM MULTIMARCAS',
                        whatsapp_group_url: data.whatsapp_group_url || '',
                    });
                    
                    // Update document title dynamically
                    if (data.site_name) {
                        document.title = `${data.site_name} | Realizando Sonhos`;
                    }
                    
                    // Update global CSS theme dataset
                    document.documentElement.setAttribute('data-theme', data.theme || 'dark');
                }
            } catch (error) {
                console.error('Error fetching public settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SiteContext.Provider value={{ settings, loading }}>
            {children}
        </SiteContext.Provider>
    );
};
