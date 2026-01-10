export class Colors {
    pageBackground: string = "#ffffff";
    titles: string = "#201a19";
    text: string = "#7e7e7e";
    name: string = "#534341";
    borders: string = "#e5e5e5";
    cardBackground: string = "#ffffff";
    cardAlt: string = "#f5f5f5";
    primaryButtonBackground: string = "#171717";
    primaryButtonText: string = "#ffffff";
    primaryButtonHover: string = "#333333";
    primaryButtonBorder: string = "#eaeaea";
    secondaryButtonBackground: string = "#ffffff";
    secondaryButtonText: string = "#171717";
    secondaryButtonHover: string = "#f5f5f5";
    secondaryButtonBorder: string = "#d4d4d4";
    segmentedBg: string = "#f5f5f5";
    segmentedText: string = "#201a19";
    segmentedAlt: string = "#ffffff";

    static newColors(): Colors {
        return new Colors();
    }
} 