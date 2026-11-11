import placeholder from "@/assets/placeholder/article.svg";
export default function ArticleImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return <img className={className} src={src || placeholder} alt={alt} onError={(event) => { if (event.currentTarget.getAttribute("src") !== placeholder) event.currentTarget.src = placeholder; }} />;
}
