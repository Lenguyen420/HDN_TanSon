import type { RegistrationCompany } from "@/datas/types";
import type { RegistrationFieldsProps } from "./personal-fields";
import { registrationToday } from "@/services/registration";
import RegistrationField from "./registration-field";

export default function CompanyFields({
  draft,
  onChange,
  companies,
}: RegistrationFieldsProps & { companies: RegistrationCompany[] }) {
  return (
    <>
      <div className="member-company-group">
        {!draft.unknownCompany ? (
          <RegistrationField
            id="register-company"
            label="Đơn vị công tác"
            required
          >
            <select
              id="register-company"
              name="companyId"
              required
              className={draft.companyId ? undefined : "is-placeholder"}
              value={draft.companyId}
              onChange={(event) =>
                onChange({
                  companyId: event.target.value,
                  companyFoundedAt:
                    companies.find(
                      (company) => company.id === event.target.value,
                    )?.companyFoundedAt || "",
                })
              }
            >
              <option value="" disabled>
                Chọn đơn vị
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </RegistrationField>
        ) : (
          <span className="member-company-label">Đơn vị công tác</span>
        )}
        {companies.length > 0 && (
          <label className="unknown-company-option">
            <input
              type="checkbox"
              name="unknownCompany"
              checked={draft.unknownCompany}
              onChange={(event) =>
                onChange({ unknownCompany: event.target.checked })
              }
            />
            <span>Đơn vị chưa có trong danh sách</span>
          </label>
        )}
      </div>
      {draft.unknownCompany && (
        <>
          <RegistrationField
            id="register-company-name"
            label="Tên đơn vị / doanh nghiệp"
            required
          >
            <input
              id="register-company-name"
              name="companyName"
              autoComplete="organization"
              required
              placeholder="Công ty TNHH ABC"
              value={draft.companyName}
              onChange={(event) =>
                onChange({ companyName: event.target.value })
              }
            />
          </RegistrationField>

          <RegistrationField
            id="register-company-founded"
            label="Ngày thành lập doanh nghiệp"
          >
            <input
              id="register-company-founded"
              name="companyFoundedAt"
              type="date"
              max={registrationToday()}
              value={draft.companyFoundedAt}
              onChange={(event) =>
                onChange({ companyFoundedAt: event.target.value })
              }
            />
          </RegistrationField>
          <RegistrationField id="register-tax-code" label="Mã số thuế">
            <input
              id="register-tax-code"
              name="taxCode"
              inputMode="numeric"
              placeholder="0312345678"
              value={draft.taxCode}
              onChange={(event) => onChange({ taxCode: event.target.value })}
            />
          </RegistrationField>
          <RegistrationField
            id="register-company-address"
            label="Địa chỉ doanh nghiệp"
          >
            <input
              id="register-company-address"
              name="companyAddress"
              autoComplete="street-address"
              placeholder="Số nhà, đường, phường, quận..."
              value={draft.companyAddress}
              onChange={(event) =>
                onChange({ companyAddress: event.target.value })
              }
            />
          </RegistrationField>
        </>
      )}
      {!draft.unknownCompany && (
        <RegistrationField
          id="register-company-founded"
          label="Ngày thành lập doanh nghiệp"
        >
          <input
            id="register-company-founded"
            name="companyFoundedAt"
            type="date"
            max={registrationToday()}
            value={draft.companyFoundedAt}
            onChange={(event) =>
              onChange({ companyFoundedAt: event.target.value })
            }
          />
        </RegistrationField>
      )}
      <RegistrationField id="register-position" label="Chức vụ">
        <input
          id="register-position"
          name="position"
          autoComplete="organization-title"
          placeholder="Giám đốc / Nhân viên..."
          value={draft.position}
          onChange={(event) => onChange({ position: event.target.value })}
        />
      </RegistrationField>
    </>
  );
}
