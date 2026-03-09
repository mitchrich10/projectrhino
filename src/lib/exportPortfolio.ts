export function exportActivePortfolioToCSV() {
  const activePortfolio = [
    { name: "Arlo", category: "Healthcare Services", website: "https://arlo-health.ca/" },
    { name: "Twig Fertility", category: "Healthcare Services", website: "https://twigfertility.com" },
    { name: "Upper Village", category: "Healthcare Services", website: "https://www.uppervillagevet.com" },
    { name: "Flint", category: "Healthcare Services", website: "https://www.withflint.com" },
    { name: "Stem Health", category: "Healthcare Services", website: "http://www.stemhealth.ca" },
    { name: "Article", category: "Ecommerce", website: "http://www.article.com" },
    { name: "FISPAN", category: "FinTech", website: "http://www.fispan.com" },
    { name: "Elective", category: "Lending", website: "http://www.elective.com" },
    { name: "Klue", category: "Enterprise SaaS", website: "http://www.klue.com" },
    { name: "Aspect Biosystems", category: "Biotech", website: "http://www.aspectbiosystems.com" },
    { name: "Quinn AI", category: "AI", website: "http://quinn-ai.com" },
    { name: "ShopVision", category: "AI", website: "https://www.shopvision.ai" },
    { name: "NetNow", category: "FinTech", website: "http://www.netnow.io" },
    { name: "MYFO", category: "FinTech", website: "https://www.myfotech.com" },
    { name: "SuperAdvisor", category: "FinTech", website: "http://www.superadvisor.ai" },
    { name: "Marz", category: "VFX", website: "https://monstersaliensrobotszombies.com" },
    { name: "Showbie", category: "EdTech", website: "http://www.showbie.com" },
    { name: "Edvisor", category: "EdTech", website: "http://www.edvisor.io" },
    { name: "Fatigue Science", category: "Enterprise SaaS", website: "http://www.fatiguescience.com" },
    { name: "Pluto", category: "FinTech", website: "https://www.getpluto.com" },
  ];

  const header = ["Company Name", "Category", "Website"];
  const rows = activePortfolio.map(c => [c.name, c.category, c.website]);

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rhino-active-portfolio.csv";
  link.click();
  URL.revokeObjectURL(url);
}
