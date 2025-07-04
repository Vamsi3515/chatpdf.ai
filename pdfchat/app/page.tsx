import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BrainCogIcon, EyeIcon, GlobeIcon, MonitorSmartphoneIcon, ServerCogIcon, ZapIcon } from "lucide-react";

export default function Home() {

  const features = [
    {
      title: "Store Your PDF Documents",
      description: "Keep all your important PDF files securely stored and easily accessible anytime, anywhere.",
      icon: GlobeIcon,
    },
    {
      title: "Blazing Fast Responses",
      description: "Experience lightning-fast answers to your queries, ensuring you get the information you need instantly.",
      icon: ZapIcon,
    },
    {
      title: "Chat Memorisation",
      description: "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized experience.",
      icon: BrainCogIcon,
    },
    {
      title: "Interactive PDF Viewer",
      description: "Engage with your PDFs like never before using our intuitive and interactive viewer.",
      icon: EyeIcon,
    },
    {
      title: "Cloud Backup",
      description: "Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage.",
      icon: ServerCogIcon,
    },
    {
      title: "Responsive Across Devices",
      description: "Access and chat with your PDFs seamlessly on any device, whether it's your desktop, tablet, or smartphone.",
      icon: MonitorSmartphoneIcon,
    },
  ];

  return (
      <main className="flex-1 overflow-scroll p-2 lg:p-3 bg-gradient-to-bl from-orange-400 to-white">
        <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
          <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-indigo-800 text-base font-semibold leading-7">Your Interactive Document Companion</h2>
              <p className="text-black font-bold text-3xl sm:text-5xl tracking-tight mt-2">Transform Your PDFs into Interactive Conversations</p>
              <p className="mt-5">Introducing <span className="text-indigo-900">Chat with PDF</span></p>
              <p className="mt-6 text-lg leading-8 text-gray-800">Upload your document, and our chatbot will answer Questions, summarize content and answer all your Qs. Ideal for everyone, Chat with PDF turns static documents into <span className="font-bold">dynamic conversations</span>, enhancing productivity 10x fold effortlessly.</p>
              <Button asChild className="cursor-pointer mt-10"><Link href='/dashboard'>Get Started</Link></Button>
            </div>
          </div>

          <div className="relative overflow-hidden pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-16">
              <Image
              alt="App Screenshot"
              src="https://ik.imagekit.io/svk3515/Screenshot%202025-06-01%20123738.png?updatedAt=1748762354275"
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
              />
              <div aria-hidden="true" className="relative">
                <div className="absolute bottom-0 bg-gradient-to-t from-white/95 pt-[5%] -inset-x-32"></div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid grid-cols-1 max-w-2xl gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature, index) => (
                <div className="relative pl-9" key={index}>
                  <dt className="inline font-semibold text-gray-900"><feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-600" /></dt>
                  <dd><span>{feature.title}</span>{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </main>
  );
}