import Image from 'next/image';

export function TailsIcon() {
    return (
        <Image 
            src="/coin_tail.png" 
            alt="Tails" 
            width={100} 
            height={100} 
            className="rounded-full"
        />
    );
}
