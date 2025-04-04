"use client";
import Image from "next/image";
import Link from "next/link";

export default function SocialMedia() {
  return (
    <div className="flex justify-center gap-8 mt-5 ">
      <Link
        href="https://www.instagram.com/perfumes.importados.777/"
        target="_blank"
        className="flex flex-col items-center"
      >
        <Image
          src="https://i.ibb.co/PsHYNF3M/Instagram-icon.png"
          alt="Instagram"
          width={50}
          height={50}
          className="cursor-pointer"
        />
        <span className="mt-2 text-sm font-medium">Instagram</span>
      </Link>
      <Link
        href="https://wa.me/+5493832460459?text=Hola%20buenas%20noches.%20Me%20gustaria%20saber%20como%20realizo%20mi%20pedido.%20Muchas%20Gracias."
        target="_blank"
        className="flex flex-col items-center"
      >
        <Image
          src="https://i.ibb.co/YBQvwd1K/Whats-App-icon.png"
          alt="WhatsApp"
          width={50}
          height={50}
          className="cursor-pointer"
        />
        <span className="mt-2 text-sm font-medium">WhatsApp</span>
      </Link>
    </div>
  );
}
