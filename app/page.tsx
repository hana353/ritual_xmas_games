import { readdirSync } from "fs";
import MainPage from "@/app/ui/main-page";
import path from "path";

export default function Home() {
  // ❌ Sai: "../xmas-decorate/public"
  // const publicPath = path.normalize("../xmas-decorate/public");

  // ✅ Đúng trên Vercel:
  const publicPath = path.join(process.cwd(), "public");

  let treeLinks: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const treeFolder = path.join(publicPath, "trees", i.toString());
    const treeFiles = readdirSync(treeFolder).map(
      file => `trees/${i}/${file}`
    );
    treeLinks.push(...treeFiles);
  }

  const itemLinks = readdirSync(path.join(publicPath, "items")).map(
    file => `items/${file}`
  );
  const petLinks = readdirSync(path.join(publicPath, "pet")).map(
    file => `pet/${file}`
  );
  const ribbonLinks = readdirSync(path.join(publicPath, "ribbon")).map(
    file => `ribbon/${file}`
  );

  return (
    <MainPage
      treeLinks={treeLinks}
      itemLinks={itemLinks}
      petLinks={petLinks}
      ribbonLinks={ribbonLinks}
    />
  );
}
//change this file 