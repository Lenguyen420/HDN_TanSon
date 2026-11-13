const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildSync } = require("esbuild");

global.window = global;
global.localStorage = { getItem: () => null };

async function loadServices(mock = false) {
  const { outputFiles } = buildSync({
    stdin: { contents: 'export * from "./src/services/introduction-video"; export * from "./src/services/api"; export * from "./src/services/content"; export * from "./src/services/association"; export * from "./src/services/registration";', resolveDir: process.cwd() },
    bundle: true, write: false, platform: "node", format: "esm",
    loader: { ".jpg": "dataurl", ".png": "dataurl", ".jpeg": "dataurl", ".svg": "dataurl", ".webp": "dataurl" },
    define: { "import.meta.env": JSON.stringify({ VITE_API_BASE_URL: "http://localhost:4000/api/v1/", VITE_USE_MOCK_DATA: String(mock) }) },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);
}

test("public API integration", async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const services = await loadServices();
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });

  await t.test("resolves upload paths against backend host", () => {
    assert.equal(services.resolveApiImage("uploads/news/photo.jpg"), "http://localhost:4000/uploads/news/photo.jpg");
    assert.equal(services.resolveApiImage("/uploads/news/photo.jpg"), "http://localhost:4000/uploads/news/photo.jpg");
    assert.equal(services.resolveApiImage("https://cdn.example.com/photo.jpg"), "https://cdn.example.com/photo.jpg");
    assert.equal(services.resolveApiImage(""), null);
  });

  await t.test("serves migrated banner files and preserves new remote image URLs", async () => {
    global.fetch = async () => reply({ data: [
      { id: "old", image: "uploads/banners/c45fd865-8891-4c6c-8d4b-79a6150cc44a.webp", alt: "Old banner" },
      { id: "new", image: "https://cdn.example.com/new.webp", alt: "New banner" },
    ], pagination: { total: 2 } });
    const banners = await services.getBanners();
    assert.match(banners[0].image, /^data:image\/webp;base64,/);
    assert.equal(banners[0].alt, "Old banner");
    assert.equal(banners[1].image, "https://cdn.example.com/new.webp");
  });

  await t.test("introduction videos accept HTTPS and normalize YouTube embeds", () => {
    assert.equal(services.introductionVideoSource(""), null);
    assert.equal(services.introductionVideoSource("javascript:alert(1)"), null);
    assert.equal(services.introductionVideoSource("http://cdn.example.com/video.mp4"), null);
    assert.equal(services.introductionVideoSource("https://user:secret@example.com/video.mp4"), null);
    assert.equal(services.introductionVideoSource("https://youtu.be/invalid"), null);
    for(const url of ["https://youtu.be/M7lc1UVf-VE", "https://www.youtube.com/watch?v=M7lc1UVf-VE", "https://www.youtube.com/shorts/M7lc1UVf-VE"]) {
      assert.equal(services.introductionVideoSource(url).url, "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE");
    }
    assert.equal(services.introductionVideoSource("https://cdn.example.com/video.mp4").kind, "video");
    const managed = "/api/v1/public/introduction-videos/00000000-0000-4000-8000-000000000000";
    assert.equal(services.introductionVideoSource(managed).url, "http://localhost:4000" + managed);
    assert.equal(services.introductionVideoSource("/api/v1/public/introduction-videos/bad-id"), null);
    const local = "/uploads/introduction-videos/00000000-0000-4000-8000-000000000000.mp4";
    assert.equal(services.introductionVideoSource(local).url, "http://localhost:4000" + local);
    assert.equal(services.introductionVideoSource(local.replace(".mp4", ".webm")).kind, "video");
    assert.equal(services.introductionVideoSource("/uploads/introduction-videos/../../.env"), null);
    assert.equal(services.introductionVideoSource("/uploads/introduction-videos/bad.mp4"), null);
  });

  await t.test("loads every page", async () => {
    const urls = [];
    global.fetch = async (url) => {
      urls.push(url);
      return reply({ data: [{ id: String(urls.length) }], pagination: { total: 2 } });
    };
    assert.equal((await services.getAllPublicItems("news")).length, 2);
    assert.match(urls[1], /page=2&limit=100$/);
  });

  await t.test("maps settings and published content without sample personal records", async () => {
    global.fetch = async (url, options) => {
      assert.ok(!options?.headers?.Authorization);
      assert.ok(!url.includes("/member/"));
      if (url.endsWith("settings")) return reply({ data: {
        introduction: "Giới thiệu", introductionVideoUrl: "/uploads/introduction-videos/00000000-0000-4000-8000-000000000000.mp4", mission: "Sứ mệnh", department: "Ban thư ký", address: "Tân Sơn", hours: "08:00", phone: "0901234567", email: "", zaloUrl: "",
        assistantGreeting: "Xin chào", assistantQuestions: "Câu hỏi | Trả lời | chi tiết\n",
      } });
      const data = url.includes("/news?") ? [{ id: "news-real", image: "uploads/news/photo.jpg" }]
        : url.includes("/notification-feed?") ? [{ id: "notice-real" }]
        : url.includes("/public/members?") ? [{ id: "public-member", name: "Hội viên", company: "Công ty", isBoard: true, avatar:"uploads/members/avatar.png" }] : [];
      return reply({ data, pagination: { total: data.length } });
    };
    const data = await services.getAppData();
    assert.equal(data.isDemo, false);
    assert.equal(data.utilityPages.about.introductionVideoUrl, "/uploads/introduction-videos/00000000-0000-4000-8000-000000000000.mp4");
    assert.equal(data.members[0].id, "public-member");
    assert.equal(data.members[0].avatar,"http://localhost:4000/uploads/members/avatar.png");
    assert.equal(data.memberAccess, "granted");
    assert.equal(data.profile.memberId, "");
    assert.deepEqual(data.utilityPages.fees, []);
    assert.deepEqual(data.registration.companies, [{ id: "public-member", name: "Công ty" }]);
    assert.equal(data.notifications[0].unread, true);
    assert.equal(data.content.news.articles[0].image, "http://localhost:4000/uploads/news/photo.jpg");
    assert.deepEqual(data.utilityPages.assistant.questions, [{ question: "Câu hỏi", answer: "Trả lời | chi tiết" }]);
    assert.equal(data.utilityPages.contact.hotlines[0].number, "0901234567");
  });

  await t.test("scoped screens deduplicate requests and publish partial data before slow content", async () => {
    let release;
    let progress;
    const gate = new Promise((resolve) => { release = resolve; });
    const firstProgress = new Promise((resolve) => { progress = resolve; });
    const urls = [];
    global.fetch = async (url) => {
      urls.push(url);
      if (url.endsWith("settings")) return reply({ data: { introduction: "Ready early", assistantQuestions: "" } });
      await gate;
      return reply({ data: [], pagination: { total: 0 } });
    };
    const first = services.getAppData({ resources: ["settings", "news"], force: true, onUpdate: (data) => { if (data.utilityPages.about.introduction === "Ready early") progress(); } });
    const second = services.getAppData({ resources: ["settings", "news"] });
    await firstProgress;
    assert.equal(urls.length, 2);
    assert.ok(urls.every((url) => url.includes("settings") || url.includes("news")));
    release();
    await Promise.all([first, second]);
    await services.getAppData({ resources: ["settings", "news"] });
    assert.equal(urls.length, 2);
  });

  await t.test("uploaded event documents resolve against backend and retain optional lists", async () => {
    global.fetch = async () => reply({ data: [{ id: "event", event: { date: "2026-12-01", time: "08:00 - 10:00", agenda: [], documents: [{ id: "doc", title: "Document", url: "/api/v1/public/event-files/00000000-0000-4000-8000-000000000000" }] } }], pagination: { total: 1 } });
    const events = await services.getArticles("events");
    assert.equal(events[0].event.documents[0].url, "http://localhost:4000/api/v1/public/event-files/00000000-0000-4000-8000-000000000000");
    assert.equal(events[0].event.minutes, undefined);
  });

  await t.test("submits only fields accepted by public registration DTO", async () => {
    const license = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
    const draft = { ...services.readRegistrationDraft([]), businessLicenseImage: license, fullName: " Nguyễn Văn A ", phone: "0901234567", birthDate: "1990-01-01", companyName: " Công ty A ", position: " Giám đốc ", taxCode: "123", companyAddress: "Tân Sơn", companyFoundedAt: "2010-05-20" };
    global.fetch = async (url, options) => {
      assert.equal(url, "http://localhost:4000/api/v1/public/registrations");
      assert.equal(options.method, "POST");
      const { notificationToken, businessLicenseImage, ...submitted } = JSON.parse(options.body);
      assert.equal(businessLicenseImage, license);
      assert.match(notificationToken, /^[a-f0-9]{64}$/);
      assert.deepEqual(submitted, { fullName: "Nguyễn Văn A", phone: "0901234567", birthDate: "1990-01-01", email: "", company: "Công ty A", jobTitle: "Giám đốc", taxCode: "123", companyAddress: "Tân Sơn", companyFoundedAt: "2010-05-20" });
      return reply({ data: { id: "receipt-1", status: "pending" }, message: "Đã tiếp nhận" }, 201);
    };
    assert.equal((await services.submitRegistration(draft, [])).data.id, "receipt-1");
    assert.equal(services.isRegistrationValid({...draft,businessLicenseImage:""},[],"2026-11-12"),false);
    assert.equal(services.isRegistrationValid({...draft,businessLicenseImage:"https://example.com/license.png"},[],"2026-11-12"),false);
    assert.equal(services.isRegistrationValid({ ...draft, companyFoundedAt: "2099-01-01" }, [], "2026-11-12"), false);
    assert.equal(services.isRegistrationValid({ ...draft, companyFoundedAt: "2026-02-30" }, [], "2026-11-12"), false);
    assert.equal(services.isRegistrationValid({ ...draft, companyFoundedAt: "" }, [], "2026-11-12"), true);
  });

  await t.test("surfaces validation, network and invalid response errors", async () => {
    global.fetch = async () => reply({ message: ["phone: Sai định dạng", "company: Bắt buộc"] }, 400);
    await assert.rejects(services.apiRequest("public/registrations"), (error) => error.status === 400 && error.message.includes("phone:"));
    global.fetch = async () => { throw new TypeError("offline"); };
    await assert.rejects(services.apiRequest("public/news"), (error) => error.status === 0);
    global.fetch = async () => new Response("invalid json");
    await assert.rejects(services.apiRequest("public/news"), /không hợp lệ/);
  });

  await t.test("never silently replaces API failure with mock data", async () => {
    global.fetch = async () => reply({ message: "Máy chủ lỗi" }, 500);
    await assert.rejects(services.getAppData({ force: true }), /Máy chủ lỗi/);
  });

  await t.test("mock mode does not fetch or submit", async () => {
    const mockServices = await loadServices(true);
    global.fetch = async () => { throw new Error("Unexpected network call"); };
    assert.equal((await mockServices.getAppData()).isDemo, true);
    await assert.rejects(mockServices.submitRegistration({}, []), /dữ liệu mẫu/);
  });
});
