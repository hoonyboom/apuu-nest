export enum PostSortType {
  챌린지 = '챌린지',
  수친 = '수친',
  스윔클럽 = '스윔클럽',
}

export enum PostMethodType {
  온라인 = '온라인',
  오프라인 = '오프라인',
  '온/오프라인' = '온/오프라인',
}

export enum PostLevelType {
  선수 = '선수',
  마스터즈 = '마스터즈',
  상급 = '상급',
  중급 = '중급',
  기초 = '기초',
}

export enum PostStyleType {
  자유형 = '자유형',
  배영 = '배영',
  평영 = '평영',
  접영 = '접영',
}

export enum PostGoalType {
  행복 = '행복',
  스트로크 = '스트로크',
  지구력 = '지구력',
  밸런스 = '밸런스',
  스트렝스 = '스트렝스',
  기타 = '기타',
}

export const PERIOD = [
  '1주 미만',
  '1주~1개월',
  '1개월~3개월',
  '3개월~6개월',
  '장기',
] as const;
