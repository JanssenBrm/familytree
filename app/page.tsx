import Image from "next/image";
import FamilyTree from "@/components/familytree";
import Search from "@/components/search";
import Menu from "@/components/menu";

export default function Home() {
  return (
      <main>
        <FamilyTree></FamilyTree>
          <div className="absolute bottom-10 left-[50%]">
              <Menu></Menu>
          </div>
    </main>
  );
}
