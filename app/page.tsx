import { readdirSync } from "fs";
import MainPage from "@/app/ui/main-page";
import path from "path";

export default function Home() {
  const publicPath = path.normalize("../xmas-decorate/public");
  let treeLinks: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const treeFolderFiles = readdirSync(path.join(publicPath, "trees", i.toString())).map(file => `trees/${i}/${file}`);
    treeLinks.push(...treeFolderFiles);
  }

  const itemLinks = readdirSync(path.join(publicPath, "items")).map(file => `items/${file}`);
  const petLinks = readdirSync(path.join(publicPath, "pet")).map(file => `pet/${file}`);
  const ribbonLinks = readdirSync(path.join(publicPath, "ribbon")).map(file => `ribbon/${file}`);

  return (
    <MainPage
      treeLinks={treeLinks}
      itemLinks={itemLinks}
      petLinks={petLinks}
      ribbonLinks={ribbonLinks}
    />
  );
}
