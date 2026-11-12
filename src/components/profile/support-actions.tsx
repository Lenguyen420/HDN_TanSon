import AppIcon from "@/components/icons";
export type ProfileSupportAction = "contact" | "about" | "policies";
export default function ProfileSupportActions({onOpen}: {onOpen: (action: ProfileSupportAction) => void}) {
  const items = [
    {id:"contact" as const, title:"Liên hệ hỗ trợ", description:"Chat Zalo, hotline và email", icon:"chat" as const},
    {id:"about" as const, title:"Về chúng tôi", description:"Tìm hiểu Hội Doanh nghiệp Phường Tân Sơn", icon:"info" as const},
    {id:"policies" as const, title:"Điều khoản & chính sách", description:"Quy định sử dụng dịch vụ", icon:"document" as const},
  ];
  return <section className="profile-support" aria-labelledby="profile-support-heading"><h2 id="profile-support-heading">Hỗ trợ</h2><div className="profile-support-list">{items.map((item) => <button key={item.id} type="button" onClick={() => onOpen(item.id)}><span className="profile-support-icon"><AppIcon name={item.icon}/></span><span className="profile-support-copy"><strong>{item.title}</strong><span>{item.description}</span></span><AppIcon name="arrow" className="profile-support-arrow"/></button>)}</div></section>;
}
