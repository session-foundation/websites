'use server';

import type * as BetterSql3 from 'better-sqlite3-multiple-ciphers';
import { FLAGS_TABLE, hasCount, openDatabase, setupDatabase } from './db';
import { getEnabledFeatureFlag } from './queries/getEnabledFeatureFlag';
import { getEnabledFeatureFlags } from './queries/getEnabledFeatureFlags';
import { getFeatureFlagContent } from './queries/getFeatureFlagContent';
import type { GenericRemoteFeatureFlag } from './utils';

type GetRemoteFeatureFlagResponse = {
  enabled: boolean;
  error?: unknown;
};

type GetRemoteFeatureFlagsResponse<Flag extends GenericRemoteFeatureFlag> = {
  flags: Array<Flag>;
  error?: unknown;
};

type GetRemoteFeatureFlagContentResponse = {
  content: string;
  error?: unknown;
};

// biome-ignore lint/suspicious/useAwait: server actions must have async in signature
export async function getRemoteFeatureFlagGeneric<Flag extends GenericRemoteFeatureFlag>(
  flag: Flag
): Promise<GetRemoteFeatureFlagResponse> {
  let db: BetterSql3.Database | undefined;
  try {
    db = openDatabase();
    const enabledFlagRow = getEnabledFeatureFlag<Flag>({ db, flag });
    const enabled = hasCount(enabledFlagRow, FLAGS_TABLE.FLAG);
    return {
      enabled,
    };
  } catch (e) {
    console.error(e);
    return {
      enabled: false,
      error: e,
    };
  } finally {
    if (db) {
      db.close();
    }
  }
}

// biome-ignore lint/suspicious/useAwait: server actions must have async in signature
export async function getRemoteFeatureFlagContentGeneric<Flag extends GenericRemoteFeatureFlag>(
  flag: Flag
): Promise<GetRemoteFeatureFlagContentResponse> {
  let db: BetterSql3.Database | undefined;
  try {
    db = openDatabase();
    const content = getFeatureFlagContent<Flag>({ db, flag }).content ?? '';
    return {
      content,
    };
  } catch (e) {
    console.error(e);
    return {
      content: '',
      error: e,
    };
  } finally {
    if (db) {
      db.close();
    }
  }
}

export async function getRemoteFeatureFlagsGeneric<
  Flag extends GenericRemoteFeatureFlag,
>(): Promise<GetRemoteFeatureFlagsResponse<Flag>> {
  let db: BetterSql3.Database | undefined;
  try {
    db = openDatabase();
    const enabledFlagsRows = getEnabledFeatureFlags({ db });
    const flags = enabledFlagsRows.flatMap((row) => row.flag) as Array<Flag>;
    return {
      flags,
    };
  } catch (e) {
    console.error(e);
    return {
      flags: [],
      error: e,
    };
  } finally {
    if (db) {
      db.close();
    }
  }
}

setupDatabase();
