"use client";

import { applyTheme } from "@cloudscape-design/components/theming";
import { useEffect, type ReactNode } from "react";

const AWS_PRIMARY = "#ff9903";
const AWS_PRIMARY_HOVER = "#ec7211";
const AWS_PRIMARY_ACTIVE = "#eb5f07";

/**
 * Applies Cloudscape design-token overrides so primary actions
 * (e.g. Create hosted zone) use AWS console orange instead of default blue.
 */
export function CloudscapeTheme({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { reset } = applyTheme({
      theme: {
        tokens: {
          colorBackgroundButtonPrimaryDefault: AWS_PRIMARY,
          colorBackgroundButtonPrimaryHover: AWS_PRIMARY_HOVER,
          colorBackgroundButtonPrimaryActive: AWS_PRIMARY_ACTIVE,
          colorBorderButtonPrimaryDefault: AWS_PRIMARY,
          colorBorderButtonPrimaryHover: AWS_PRIMARY_HOVER,
          colorBorderButtonPrimaryActive: AWS_PRIMARY_ACTIVE,
        },
      },
    });
    return reset;
  }, []);

  return children;
}
