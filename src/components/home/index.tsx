import { useState } from "react";
import { NavigationTab } from "../bottom-navigation";
import HomeHeader from "./header";
import Banner from "./banner";
import FollowCard from "./follow-card";
import Utilities from "./utilities";
import ExecutiveBoard from "./executive-board";
import ContentBrowser from "./content-browser";
import type { AppData, ContentCategory, UtilityId } from "@/datas/types";

interface HomeProps {
  data: AppData;
  onNavigate: (tab: NavigationTab) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenUtility: (id: UtilityId) => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  contentCategory: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
}

export default function Home({ data, onNavigate, onOpenContent, onOpenUtility, onOpenArticle, contentCategory, onChangeCategory }: HomeProps) {
  const [showOaNotice, setShowOaNotice] = useState(false);

  return (
    <>
      <div className="home-hero">
        <HomeHeader association={data.association} />
        <Banner banners={data.banners} />
      </div>
      <main className="home-content">
        <FollowCard association={data.association} onFollow={() => setShowOaNotice((current) => !current)} />
        {showOaNotice && <p className="oa-notice" role="status">{data.association.oaNotice}</p>}
        <Utilities utilities={data.utilities} onSelect={(index) => onOpenUtility(data.utilities[index].id)} />
        <ExecutiveBoard members={data.members.filter((member) => member.isBoard)} isDemo={data.isDemo} accessRequired={data.memberAccess === "required"} onViewAll={() => onNavigate("members")} />
        <ContentBrowser data={data} category={contentCategory} onChangeCategory={onChangeCategory} onOpenContent={onOpenContent} onOpenArticle={onOpenArticle} />
        <div className="community-note">
          <span /><p>{data.association.slogan}</p><span />
        </div>
      </main>
    </>
  );
}
