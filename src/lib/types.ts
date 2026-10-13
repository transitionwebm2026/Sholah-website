import type {StaticImageData} from 'next/image';

export type FaqItem = {question: string; answer: string};

export type Step = {title: string; description: string};

export type Review = {name: string; procedure: string; text: string};

export type ServiceId = 'laparoscopic' | 'hernia' | 'anorectal' | 'endocrine';

/** As written in the message files; `id` is also the image file name in `src/assets/images/procedures`. */
export type ProcedureContent = Step & {id: string};

export type Procedure = ProcedureContent & {image: StaticImageData};

export type ServiceCategoryContent = {
  id: ServiceId;
  title: string;
  summary: string;
  description: string;
  procedures: ProcedureContent[];
};

export type ServiceCategory = Omit<ServiceCategoryContent, 'procedures'> & {procedures: Procedure[]};

export type ArticleContent = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  intro: string;
  sections: Array<{heading: string; paragraphs: string[]}>;
};

export type Article = ArticleContent & {
  image: StaticImageData;
  published: string;
  readMinutes: number;
};

export type VideoContent = {id: string; title: string};

export type Video = VideoContent & {
  youtubeId: string;
  poster: StaticImageData;
  duration: string;
};

export type Branch = {id: string; name: string; street: string; area: string; city: string};

export type OpeningHours = {days: string; time: string};
