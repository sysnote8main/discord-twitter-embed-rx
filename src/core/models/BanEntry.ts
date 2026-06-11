/**
 * BAN エントリの型定義
 *
 * Bot 管理者がユーザーまたはサーバーを BAN した際の記録。
 * Core レイヤーに属するため、外部依存なし。
 */

/** BAN 対象の種別 */
export type BanTargetType = "user" | "guild";

/**
 * 1件の BAN レコード
 */
export interface BanEntry {
  /** BAN された対象の ID（userId または guildId） */
  targetId: string;
  /** BAN 対象の種別 */
  targetType: BanTargetType;
  /** BAN 理由（任意） */
  reason: string;
  /** BAN を実行した管理者の Discord ユーザーID */
  bannedBy: string;
  /** BAN 実行日時（ISO 8601） */
  bannedAt: string;
}

/**
 * BAN 永続化リポジトリのインターフェース
 * Adapter / Infrastructure 層で実装する
 */
export interface IBanRepository {
  /** 対象を BAN リストに追加する */
  addBan(entry: BanEntry): Promise<void>;
  /** 対象の BAN を解除する */
  removeBan(targetId: string, targetType: BanTargetType): Promise<void>;
  /** 対象が BAN されているか確認する */
  isBanned(targetId: string, targetType: BanTargetType): Promise<boolean>;
  /** 全 BAN エントリを取得する（targetType でフィルタ可能） */
  listBans(targetType?: BanTargetType): Promise<BanEntry[]>;
  /** 1件の BAN 情報を取得する */
  getBan(targetId: string, targetType: BanTargetType): Promise<BanEntry | null>;
}

/**
 * BAN リスト操作の結果
 */
export interface BanOperationResult {
  success: boolean;
  message: string;
}
