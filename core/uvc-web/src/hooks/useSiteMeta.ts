import { useEffect } from 'react';

const setMeta = (attribute: 'name' | 'property', key: string, content?: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!content) {
        element?.remove();
        return;
    }
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

interface SiteMeta {
    title?: string;
    description?: string;
    image?: string;
}

/** Sets document title and Open Graph tags for public group sites. */
export const useSiteMeta = ({ title, description, image }: SiteMeta) => {
    useEffect(() => {
        if (!title) return;
        const previousTitle = document.title;
        document.title = title;
        setMeta('name', 'description', description);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:image', image);
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:url', window.location.href);
        return () => {
            document.title = previousTitle;
        };
    }, [title, description, image]);
};
