import { useState } from "react";
import type { MemberDirectoryScope } from "@/components/shared/page-props";
import HomeHeader from "./header";
import Banner from "./banner";
import FollowCard from "./follow-card";
import Utilities from "./utilities";
import ExecutiveBoard from "./executive-board";
import HomeMembers from "./members";
import ContentBrowser from "./content-browser";
import type { AppData, ContentCategory, UtilityId } from "@/datas/types";

interface HomeProps {
  data: AppData;
  onOpenMemberDirectory: (scope: MemberDirectoryScope) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenUtility: (id: UtilityId) => void;
  onOpenWardMiniApp: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  contentCategory: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
}

export default function Home({ data, onOpenMemberDirectory, onOpenContent, onOpenUtility, onOpenWardMiniApp, onOpenArticle, contentCategory, onChangeCategory }: HomeProps) {
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
        <Utilities utilities={data.utilities} onSelect={(index) => {
          const { id } = data.utilities[index];
          if (id === "tan-son-ward") onOpenWardMiniApp();
          else onOpenUtility(id);
        }} />
        <ExecutiveBoard members={data.members.filter((member) => member.isBoard)} isDemo={data.isDemo} accessRequired={data.memberAccess === "required"} onViewAll={() => onOpenMemberDirectory("board")} />
        <HomeMembers members={data.memberAccess === "required" ? [] : data.members} onViewAll={() => onOpenMemberDirectory("all")} />
        <ContentBrowser data={data} category={contentCategory} onChangeCategory={onChangeCategory} onOpenContent={onOpenContent} onOpenArticle={onOpenArticle} />
        <div className="community-note">
          <span /><p>{data.association.slogan}</p><span />
        </div>
      </main>
    </>
  );
}
