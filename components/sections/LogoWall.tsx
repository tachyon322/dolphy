import Image from "next/image";

type Logo = {
  label: string;
  href: string;
  src: string;
  width: number;
  height: number;
};

const LOGOS: Logo[] = [
  {
    label: "Tencent",
    href: "https://www.tencent.com/",
    src: "/img/logos/tencent-light.webp",
    width: 83,
    height: 30,
  },
  {
    label: "ByteDance",
    href: "https://www.bytedance.com/",
    src: "/img/logos/bytedance-light.webp",
    width: 111,
    height: 30,
  },
  {
    label: "NetEase Games",
    href: "https://www.neteasegames.com/",
    src: "/img/logos/netease-games-light.webp",
    width: 81,
    height: 30,
  },
  {
    label: "Virtual Flow",
    href: "https://t4framework.com/",
    src: "/img/logos/virtual-flow-light.webp",
    width: 111,
    height: 30,
  },
  {
    label: "Bambu Lab",
    href: "https://bambulab.com/",
    src: "/img/logos/bambu-lab-light.webp",
    width: 80,
    height: 30,
  },
  {
    label: "HTC",
    href: "https://www.htc.com/",
    src: "/img/logos/htc-light.webp",
    width: 47,
    height: 30,
  },
  {
    label: "Civitai",
    href: "https://civitai.com/",
    src: "/img/logos/civitai-light.webp",
    width: 71,
    height: 30,
  },
  {
    label: "Makeronline",
    href: "https://www.makeronline.com/",
    src: "/img/logos/makeronline-light.webp",
    width: 45,
    height: 30,
  },
  {
    label: "stability.ai",
    href: "https://stability.ai/",
    src: "/img/logos/stability-ai-light.webp",
    width: 92,
    height: 30,
  },
  {
    label: "Layer AI",
    href: "https://www.layer.ai/",
    src: "/img/logos/layer-ai-light.webp",
    width: 61,
    height: 30,
  },
  {
    label: "Nilo",
    href: "https://www.nilo.io/",
    src: "/img/logos/nilo-light.webp",
    width: 29,
    height: 30,
  },
  {
    label: "Style 3D",
    href: "https://www.style3d.ai/?refer=tripo3d",
    src: "/img/logos/style-3d-light.webp",
    width: 102,
    height: 30,
  },
];

function LogoSet({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden} style={{ gap: 0 }}>
      {LOGOS.map((l) => (
        <div
          key={l.label + (hidden ? "-dup" : "")}
          className="flex shrink-0 items-center justify-center"
          style={{ marginRight: 42 }}
        >
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className="flex items-center justify-center"
          >
            <Image
              alt={l.label}
              src={l.src}
              width={l.width}
              height={l.height}
              decoding="async"
              className="h-[30px] w-auto object-contain"
              style={{ width: l.width, height: 30 }}
            />
          </a>
        </div>
      ))}
    </div>
  );
}

export function LogoWall() {
  return (
    <div className="w-full border-t border-black/[0.04] py-6">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{
            animation: "marquee 30s linear infinite",
            transform: "translateX(0)",
          }}
        >
          <LogoSet />
          <LogoSet hidden />
        </div>
      </div>
    </div>
  );
}
