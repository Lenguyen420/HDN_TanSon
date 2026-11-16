const test = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
test("partner list shows money and in-kind contributions and a visible history action", async () => {
  const { outputFiles } = await build({
    stdin: {
      contents:
        'import {renderToStaticMarkup} from "react-dom/server"; import List from "./src/components/sponsorships"; export const render = props => renderToStaticMarkup(<List {...props}/>);',
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
    loader: {
      ".scss": "empty",
      ".svg": "dataurl",
      ".png": "dataurl",
      ".jpg": "dataurl",
      ".webp": "dataurl",
    },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  const rows = [
    {
      id: "partner",
      name: "Doanh nghiệp A",
      logo: "",
      industry: "Dịch vụ",
      updatedAt: "2026-11-16",
      totalAmount: 2000000,
      contributionCount: 2,
      latestContributions: [
        {
          id: "money",
          title: "Chăm lo Tết",
          type: "money",
          amount: 2000000,
          contributionDate: "2026-11-16",
        },
        {
          id: "items",
          title: "Tặng học bổng",
          type: "in_kind",
          itemName: "Bộ sách",
          quantity: 25,
          contributionDate: "2026-11-15",
        },
      ],
    },
  ];
  const props = {
    onBack: () => {},
    onOpenPartner: () => {},
    partners: {
      rows,
      summary: { totalAmount: 2000000, totalPartners: 1, contributionCount: 2 },
      sort: "amount",
      search: "",
      page: 1,
      total: 1,
      setSort: () => {},
      setSearch: () => {},
      loading: false,
      error: "",
    },
  };
  const html = module.exports.render(props);
  assert.match(html, /Chăm lo Tết/);
  assert.match(html, /Tặng học bổng/);
  assert.match(html, /Bộ sách · Số lượng: 25/);
  assert.match(html, /2\.000\.000/);
  assert.match(html, /Xem lịch sử đóng góp \(2\)/);
  assert.doesNotMatch(html, /Thêm khoản đóng góp|Gửi thông báo|Chỉnh sửa/);
  const empty = module.exports.render({
    ...props,
    partners: {
      ...props.partners,
      rows: [{ ...rows[0], contributionCount: 0, latestContributions: [] }],
    },
  });
  assert.match(empty, /Chưa có khoản đóng góp công khai/);
});
