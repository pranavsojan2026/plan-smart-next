declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export const ArrowRight: ComponentType<LucideProps>;
  export const Calendar: ComponentType<LucideProps>;
  export const Camera: ComponentType<LucideProps>;
  export const MapPin: ComponentType<LucideProps>;
  export const Utensils: ComponentType<LucideProps>;
} 