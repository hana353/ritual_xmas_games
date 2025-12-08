// app/page.tsx
import MainPage from "@/app/ui/main-page";

export const dynamic = "force-static";

export default function Home() {
  // --- TREES ---
  // Có 5 folder tree: 1,2,3,4,5
  // Mỗi folder có 4 file: x.1.png → x.4.png
  const treeLinks: string[] = Array.from({ length: 5 }, (_, folderIndex) =>
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

  // --- BACKGROUND (5 backgrounds) ---
  const backgroundLinks: string[] = [
    'BackGround/BG1.png',
    'BackGround/BG2.png',
    'BackGround/BG3.png',
    'BackGround/BG4.jpg',
    'BackGround/BG5.png',
  ];

  // --- SIGGY (10 siggy) ---
  const siggyLinks: string[] = [
    'siggy/2.png',
    'siggy/den.png',
    'siggy/hong.png',
    'siggy/meo 1.png',
    'siggy/noel do.png',
    'siggy/noel xanh.png',
    'siggy/tim.png',
    'siggy/vang.png',
    'siggy/xanh la.png',
    'siggy/xanh.png',
  ];

  return (
    <MainPage
      treeLinks={treeLinks}
      itemLinks={itemLinks}
      petLinks={petLinks}
      ribbonLinks={ribbonLinks}
      backgroundLinks={backgroundLinks}
      siggyLinks={siggyLinks}
    />
  );
}
