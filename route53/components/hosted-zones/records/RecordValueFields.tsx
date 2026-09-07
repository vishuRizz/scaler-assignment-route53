"use client";

import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Textarea from "@cloudscape-design/components/textarea";
import type { DnsRecordType } from "@/lib/types/dns-record";
import {
  type RecordValueParts,
  valuePlaceholder,
} from "@/lib/constants/record-form";
import styles from "./CreateRecordPage.module.css";

function InfoLink() {
  return (
    <Link href="#" fontSize="body-s">
      Info
    </Link>
  );
}

type RecordValueFieldsProps = {
  type: DnsRecordType;
  alias: boolean;
  parts: RecordValueParts;
  errorText?: string;
  onChange: (patch: Partial<RecordValueParts>) => void;
};

/**
 * Type-aware value inputs — MX priority and SRV priority/weight/port as
 * separate fields; other types use a free-text value.
 */
export function RecordValueFields({
  type,
  alias,
  parts,
  errorText,
  onChange,
}: RecordValueFieldsProps) {
  if (alias) {
    return (
      <FormField
        label={
          <span>
            Value <InfoLink />
          </span>
        }
        description="Choose or enter an AWS resource alias target."
        errorText={errorText}
      >
        <Textarea
          value={parts.value}
          onChange={({ detail }) => onChange({ value: detail.value })}
          placeholder="Alias target (e.g. dualstack.example.elb.amazonaws.com)"
          rows={4}
        />
      </FormField>
    );
  }

  if (type === "MX") {
    return (
      <div className={styles.twoCol}>
        <FormField
          label={
            <span>
              Priority <InfoLink />
            </span>
          }
          description="Lower values have higher preference."
          errorText={errorText && !parts.mxPriority.trim() ? errorText : undefined}
        >
          <Input
            type="number"
            value={parts.mxPriority}
            onChange={({ detail }) => onChange({ mxPriority: detail.value })}
            placeholder="10"
          />
        </FormField>
        <FormField
          label={
            <span>
              Value <InfoLink />
            </span>
          }
          description="Mail server hostname."
          errorText={errorText}
        >
          <Input
            value={parts.value}
            onChange={({ detail }) => onChange({ value: detail.value })}
            placeholder={valuePlaceholder("MX")}
          />
        </FormField>
      </div>
    );
  }

  if (type === "SRV") {
    return (
      <div className={styles.recordBlock}>
        <div className={styles.twoCol}>
          <FormField
            label={
              <span>
                Priority <InfoLink />
              </span>
            }
            description="Lower values have higher preference."
          >
            <Input
              type="number"
              value={parts.srvPriority}
              onChange={({ detail }) => onChange({ srvPriority: detail.value })}
              placeholder="10"
            />
          </FormField>
          <FormField
            label={
              <span>
                Weight <InfoLink />
              </span>
            }
            description="Relative weight for records with the same priority."
          >
            <Input
              type="number"
              value={parts.srvWeight}
              onChange={({ detail }) => onChange({ srvWeight: detail.value })}
              placeholder="5"
            />
          </FormField>
        </div>
        <div className={styles.twoCol}>
          <FormField
            label={
              <span>
                Port <InfoLink />
              </span>
            }
          >
            <Input
              type="number"
              value={parts.srvPort}
              onChange={({ detail }) => onChange({ srvPort: detail.value })}
              placeholder="5060"
            />
          </FormField>
          <FormField
            label={
              <span>
                Value <InfoLink />
              </span>
            }
            description="Hostname of the target."
            errorText={errorText}
          >
            <Input
              value={parts.value}
              onChange={({ detail }) => onChange({ value: detail.value })}
              placeholder={valuePlaceholder("SRV")}
            />
          </FormField>
        </div>
      </div>
    );
  }

  return (
    <FormField
      label={
        <span>
          Value <InfoLink />
        </span>
      }
      description="Enter multiple values on separate lines."
      errorText={errorText}
    >
      <Textarea
        value={parts.value}
        onChange={({ detail }) => onChange({ value: detail.value })}
        placeholder={valuePlaceholder(type)}
        rows={4}
      />
    </FormField>
  );
}
