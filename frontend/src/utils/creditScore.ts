export type CreditBand = {
    label: string;
    range: string;
    minimum: number;
    maximum: number;
    color: string;
};

export const bands: CreditBand[] = [
    {
        label: "POOR",
        range: "300–579",
        minimum: 300,
        maximum: 579,
        color: "#B54834",
    },
    {
        label: "FAIR",
        range: "580–669",
        minimum: 580,
        maximum: 669,
        color: "#C98A4B",
    },
    {
        label: "GOOD",
        range: "670–739",
        minimum: 670,
        maximum: 739,
        color: "#D97757",
    },
    {
        label: "VERY GOOD",
        range: "740–799",
        minimum: 740,
        maximum: 799,
        color: "#6E8F5B",
    },
    {
        label: "EXCELLENT",
        range: "800–850",
        minimum: 800,
        maximum: 900,
        color: "#3F6B4E",
    },
];

export const getCreditBand = (score: number): CreditBand =>
    bands.find(
        (band) => score >= band.minimum && score <= band.maximum
    ) ?? bands[bands.length - 1];