import { fabric } from 'fabric';
import type { PDF } from '@/types/pdf';

export type TOCoord = fabric.Point & {
  corner: TCornerPoint;
  touchCorner: TCornerPoint;
};

export type TCornerPoint = {
  tl: fabric.Point;
  tr: fabric.Point;
  bl: fabric.Point;
  br: fabric.Point;
};

export interface SpecifyPageArgs {
  page: number;
  PDF: Omit<PDF, 'pages'> | PDF;
  scale: number;
}

export interface RenderImageArgs {
  url: string;
  scale?: number;
}

export interface CreateCloseSvgArgs {
  canvas: fabric.Canvas;
  event: fabric.IEvent<Event>;
  fab: fabric.Image | fabric.Text;
  stroke?: string;
  uuid?: number;
}
