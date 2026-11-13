import type {
  TradeActor,
  TradeCategory,
  TradePost,
  TradeConversation,
  TradeMessage,
  TradeNotice,
} from "@/services/trade-types";

export const previewTradeActor: TradeActor = {
  id: "preview-business",
  role: "BUSINESS",
  status: "ACTIVE",
  displayName: "Tài khoản xem thử",
  company: "Doanh nghiệp thử nghiệm",
  memberId: "preview-member",
  businessType: "GENERAL",
};
export const previewTradeCategories: TradeCategory[] = [
  {
    id: "preview-services",
    code: "SERVICES",
    name: "Sản phẩm và dịch vụ",
    sortOrder: 1,
    isActive: true,
    requiresPromotionDetails: false,
    version: 1,
  },
  {
    id: "preview-promotion",
    code: "PROMOTION",
    name: "Ưu đãi hội viên",
    sortOrder: 2,
    isActive: true,
    requiresPromotionDetails: true,
    version: 1,
  },
  {
    id: "preview-community",
    code: "COMMUNITY",
    name: "Kết nối cộng đồng",
    sortOrder: 3,
    isActive: true,
    requiresPromotionDetails: false,
    version: 1,
  },
];
export function createPreviewTradeData() {
  const now = new Date().toISOString();
  const base: TradePost = {
    id: "preview-own-post",
    slug: "preview-own-post",
    ownerId: previewTradeActor.id,
    category: "SERVICES",
    categoryId: "preview-services",
    title: "Giới thiệu dịch vụ doanh nghiệp",
    summary: "Nội dung mẫu để kiểm tra giao diện giao thương.",
    description: "Thông tin sản phẩm và dịch vụ dành cho đối tác trong Hội.",
    purpose: "COMMERCIAL",
    priceType: "CONTACT",
    address: "Phường Tân Sơn",
    contactName: "Người liên hệ mẫu",
    contactPhone: "",
    imageIds: [],
    images: [],
    status: "PUBLISHED",
    featured: true,
    viewCount: 24,
    saveCount: 3,
    averageRating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    isOwner: true,
    owner: { id: previewTradeActor.id, displayName: "Doanh nghiệp thử nghiệm" },
  };
  const posts: TradePost[] = [
    base,
    {
      ...base,
      id: "preview-partner-post",
      slug: "preview-partner-post",
      ownerId: "preview-partner",
      title: "Tìm đối tác cung ứng sản phẩm",
      featured: false,
      isOwner: false,
      owner: { id: "preview-partner", displayName: "Đối tác mẫu" },
    },
  ];
  const conversations: TradeConversation[] = [
    {
      id: "preview-conversation",
      tradePostId: posts[1].id,
      customerId: previewTradeActor.id,
      ownerId: "preview-partner",
      lastMessageAt: now,
      unreadCount: 1,
      other: "Đối tác mẫu",
      post: { id: posts[1].id, title: posts[1].title },
    },
  ];
  const messages: TradeMessage[] = [
    {
      id: "preview-message",
      conversationId: "preview-conversation",
      senderId: "preview-partner",
      content: "Chào bạn, doanh nghiệp mình có thể kết nối hợp tác nhé!",
      readAt: null,
      createdAt: now,
    },
  ];
  const notices: TradeNotice[] = [
    {
      id: "preview-notice",
      type: "TRADE_POST_APPROVED",
      tradePostId: base.id,
      slug: base.slug,
      title: base.title,
      createdAt: now,
      read: false,
    },
  ];
  return { posts, conversations, messages, notices };
}
