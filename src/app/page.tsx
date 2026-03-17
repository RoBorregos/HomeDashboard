import Image from "next/image";
import { HydrateClient } from "rbrgs/trpc/server";
import tecdemonterrey from "../../public/images/sponsors/tecdemonterrey.png";
import factory3d from "../../public/images/sponsors/3dfactory.png";
import altium from "../../public/images/sponsors/altium.png";
import github from "../../public/images/sponsors/github.png";
import robologo from "../../public/images/white-logo.png";
import Footer from "./_components/footer";
import ImageFade from "./_components/imageFade";

export default async function Home() {
  const sponsors = [
    tecdemonterrey,
    factory3d,
    altium,
    github,
  ];

  return (
    <HydrateClient>
      <main>
        <section className="relative flex min-h-[150vw] flex-col items-center justify-start overflow-hidden lg:min-h-screen lg:justify-center">
          <div className="z-10 mt-[30vw] text-center lg:mt-0">
            <h1 className="font-jersey_25 text-[15vw] leading-none text-roboblue lg:text-[10vw]">
              @HOME DASHBOARD
            </h1>
            <p className="mt-[-2vw] font-anton text-[6vw] text-white lg:text-[3vw]">
              RoboCup@Home 2026
            </p>
          </div>
          <div className="absolute left-1/2 top-[80vw] -z-10 -translate-x-1/2 -translate-y-1/2 transform lg:top-1/2">
            <Image
              src={robologo}
              alt=""
              className="w-[70vw] object-cover opacity-50 lg:w-[40vw]"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black to-transparent" />
          <ImageFade className="-z-20" />
        </section>

        <div className="mx-[10vw] text-center font-archivo text-[1rem] text-white lg:mx-[10rem] lg:text-[1.5rem]">
          <span className="text-[2rem] font-bold">Manage the </span>
          <span className="font-jersey_25 text-[4rem] text-roboblue">
            competition
          </span>
          <div className="mt-[10vw] lg:mx-[8vw] lg:mt-[1vw]">
            The official scorekeeper and management tool for RoboCup@Home 2026.
            Track scores, manage inspections, and view real-time results for the Roborregos team.
          </div>
        </div>

        <section className="mx-[5vw] mt-[5rem] grid gap-[5rem] text-[1.25rem] lg:mx-[5rem] lg:mt-[10rem] lg:grid-cols-2">
          <div className="group flex flex-col gap-4">
            <h3 className="bg-gradient-to-t from-black to-roboblue bg-clip-text font-anton text-[3rem] text-transparent transition-all duration-300 group-hover:to-blue-400 lg:ml-5 lg:text-[4rem]">
              SCORING
            </h3>
            <div className="relative rounded-xl bg-gradient-to-tr from-neutral-950 to-neutral-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(0,119,255,0.2)]">
              <p className="m-[1rem] p-10 text-justify font-archivo text-white">
                Perform real-time scoring for all competition tasks.
                Our specialized interface ensures accurate and efficient data entry for judges.
              </p>
            </div>
          </div>

          <div className="group flex flex-col gap-4">
            <h3 className="bg-gradient-to-t from-black to-roboblue bg-clip-text font-anton text-[3rem] text-transparent transition-all duration-300 group-hover:to-blue-400 lg:ml-5 lg:text-[4rem]">
              INSPECTION
            </h3>
            <div className="rounded-xl bg-gradient-to-tr from-neutral-950 to-neutral-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(0,119,255,0.2)]">
              <p className="m-[1rem] p-10 text-justify font-archivo text-white">
                Manage the technical inspection process. Keep track of checklist completion
                and overall robot readiness for the competition.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-[10vw] mt-10 text-center font-archivo text-[1rem] text-white lg:mx-[10rem] lg:text-[1.5rem]">
          <span className="text-[2rem] font-bold">Thanks to our </span>
          <span className="font-jersey_25 text-[4rem] text-roboblue">
            sponsors
          </span>
        </div>

        <section className="mt-[3rem] grid w-full grid-cols-2 gap-5 bg-white px-[5vw] py-5 lg:grid-cols-4 lg:px-[5rem]">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex items-center justify-center">
              <Image
                src={sponsor}
                alt={sponsor.src}
                className="h-[5rem] w-full max-w-[200px] object-contain"
              />
            </div>
          ))}
        </section>

        <Footer />
      </main>
    </HydrateClient>
  );
}
