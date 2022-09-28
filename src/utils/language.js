export const Language = {
  ZH: 'zh',
  EN: 'en',
}

const TXT = {
  zh: {
    loading: '加载中...',
    priority_fee: '矿工小费',
    max_fee: '最大手续费',
    pending_block_num: '下一块区块编号',
    tx_in_pending_block: '下一块交易数',
    max_price_in_pending_block: '下一块交易中最高价格',
    base_fee: '基本手续费',
  },
  en: {
    loading: 'Loading',
    priority_fee: 'PriorityFee',
    max_fee: 'MaxFee',
    pending_block_num: 'Pending Block Number',
    tx_in_pending_block: 'Transactions in Pending Block',
    max_price_in_pending_block: 'Max price in pending block',
    base_fee: 'Base Fee',
  },
}

const translate = (language, key) => {
  return TXT[language][key]
}
export default translate
