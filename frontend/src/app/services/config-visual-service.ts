import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Colors } from '../components/config-visual/colors';

@Injectable({
    providedIn: 'root'
})
export class ConfigVisualService {
    private apiUrl = "http://localhost:3000/config-visual";

    constructor(private http: HttpClient) { }

    getVisualConfig() {
        return this.http.get<Colors>(this.apiUrl);
    }

    updateVisualConfig(colors: Colors) {
        return this.http.put<Colors>(this.apiUrl, colors);
    }

    applyColors(colors: Colors) {
        if (!colors) return;
        const root = document.documentElement;
        const defaults = new Colors();

        // Helper para definir ou remover a variável baseada no valor default
        const setStyle = (variable: string, value: string, defaultValue: string) => {
            if (value && value !== defaultValue) {
                root.style.setProperty(variable, value);
            } else {
                root.style.removeProperty(variable);
            }
        };

        setStyle('--page-background', colors.pageBackground, defaults.pageBackground);
        setStyle('--titles-color', colors.titles, defaults.titles);
        setStyle('--text-color', colors.text, defaults.text);
        setStyle('--name-color', colors.name, defaults.name);
        setStyle('--borders', colors.borders, defaults.borders);
        setStyle('--elements-background', colors.cardBackground, defaults.cardBackground);
        setStyle('--elements-alt', colors.cardAlt, defaults.cardAlt);

        setStyle('--primary-btn-bg', colors.primaryButtonBackground, defaults.primaryButtonBackground);
        setStyle('--primary-btn-text', colors.primaryButtonText, defaults.primaryButtonText);
        setStyle('--primary-btn-hover', colors.primaryButtonHover, defaults.primaryButtonHover);
        setStyle('--primary-btn-border', colors.primaryButtonBorder, defaults.primaryButtonBorder);

        setStyle('--sec-btn-bg', colors.secondaryButtonBackground, defaults.secondaryButtonBackground);
        setStyle('--sec-btn-text', colors.secondaryButtonText, defaults.secondaryButtonText);
        setStyle('--sec-btn-hover', colors.secondaryButtonHover, defaults.secondaryButtonHover);
        setStyle('--sec-btn-border', colors.secondaryButtonBorder, defaults.secondaryButtonBorder);

        setStyle('--segmented-bg', colors.segmentedBg, defaults.segmentedBg);
        setStyle('--segmented-text', colors.segmentedText, defaults.segmentedText);
        setStyle('--segmented-alt', colors.segmentedAlt, defaults.segmentedAlt);
    }
}