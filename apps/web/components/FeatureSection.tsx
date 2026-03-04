import { ReactNode } from "react";
import { PencilIcon,Share2Icon,Users2Icon,ZapIcon,NavigationIcon,LayersIcon } from "lucide-react";

interface FeatureProps {
  title: string;
  content: string;
  icon: ReactNode;
}

function FeatureCard({ icon, title, content }: FeatureProps) {
  return (
    <div className="p-6 bg-[#191b24] rounded-lg flex flex-col gap-3 transition-all duration-300 hover:bg-[#1f2230] hover:-translate-y-1 group">
      <div className="w-10 h-10 flex items-center justify-center bg-[#1e2337] text-[#4870eb] rounded-xl transition group-hover:bg-[#4870eb]/10">
        {icon}
      </div>
      <div className="text-white text-xl font-semibold">
        {title}
      </div>
      <div className="text-slate-400">
        {content}
      </div>
    </div>
  );
}

export default function FeatureSection() {
  return (
    <section>
      <div className="flex flex-col justify-center items-center mt-40 mb-20">

        <div className="font-semibold text-4xl leading-tight tracking-tight mb-3">
          <span className="text-white mr-2">Everything you need to</span>
          <span className="text-[#4870eb]">create</span>
        </div>
        <p className="text-slate-400 text-lg">
          Powerful tools wrapped in a simple, intuitive interface.
        </p>

        <div className="grid grid-cols-3 max-w-4xl gap-5 mt-10">
            <FeatureCard title={"Freehand Drawing"} content="Sketch ideas naturally with a hand-drawn feel" icon={<PencilIcon />}/>
            <FeatureCard title={"Real-time Collab"} content="Work together with your team simultaneously" icon={<Users2Icon />}/>
            <FeatureCard title={"Blazing Fast"} content="Instant rendering with zero lag on any device" icon={<ZapIcon />}/>
            <FeatureCard title={"Easy Sharing"} content="Share boards with a single link, no signup needed" icon={<Share2Icon />}/>
            <FeatureCard title={"Infinite Canvas"} content="Never run out of space for your ideas" icon={<LayersIcon />}/>
            <FeatureCard title={"Smart Tools"} content="Shapes, arrows, and text snap into place" icon={<NavigationIcon />}/>
        </div>

      </div>
    </section>
  );
}
