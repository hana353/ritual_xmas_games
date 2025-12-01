// app/page.tsx
import MainPage from "@/app/ui/main-page";

export const dynamic = "force-static";

export default function Home() {
  // --- TREES ---
  // Bạn có 4 folder tree: 1,2,3,4
  // Mỗi folder có 4 file: 1.1.png → 1.4.png
  const treeLinks: string[] = Array.from({ length: 4 }, (_, folderIndex) =>
    Array.from({ length: 4 }, (_, imgIndex) =>
      `trees/${folderIndex + 1}/${folderIndex + 1}.${imgIndex + 1}.png`
    )
  ).flat();

  // --- ITEMS (45 item) ---
  const itemLinks: string[] = Array.from({ length: 45 }, (_, i) => `items/${i + 1}.png`);

  // --- PETS (14 pet) ---
  const petLinks: string[] = Array.from({ length: 14 }, (_, i) => `pet/${i + 1}.png`);

  // --- RIBBON (8 ribbon) ---
  const ribbonLinks: string[] = Array.from({ length: 8 }, (_, i) => `ribbon/${i + 1}.png`);

  return (
    <MainPage
      treeLinks={treeLinks}
      itemLinks={itemLinks}
      petLinks={petLinks}
      ribbonLinks={ribbonLinks}
    />
  );
}
