import Image from 'next/image';

export function HeadsIcon() {
    return (
        <Image 
            src="/coin_head.png" 
            alt="Heads" 
            width={100} 
            height={100} 
            className="rounded-full"
        />
    );
}
