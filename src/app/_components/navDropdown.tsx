import Image from "next/image";
import Link from "next/link";
import menu from "rbrgs/../public/images/menu.svg";
import SignInButton from "./SignInButton";
import { Session } from "next-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "r/components/ui/sheet";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export default function NavDropdown({ session }: { session: Session | null }) {
  return (
    <div className="block justify-self-end lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Image src={menu as StaticImport} alt="" className="flex h-5 w-5" />
        </SheetTrigger>
        <SheetContent
          className="flex w-screen flex-col justify-center bg-black text-white"
          side="top"
        >
          <SheetClose asChild>
            <Link href="/athome" className="w-full text-lg">
              Dashboard
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/athome/results" className="w-full text-lg">
              Results
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/athome/inspection" className="w-full text-lg">
              Inspection
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/athome/admin" className="w-full text-lg">
              Overview
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="https://www.roborregos.com" className="w-full text-lg">
              About us
            </Link>
          </SheetClose>
          {session && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <SignInButton session={session} />
            </div>
          )}
          {!session && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <SignInButton session={null} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
