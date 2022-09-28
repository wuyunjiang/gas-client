import { useContext } from 'react'
import { AppContext } from '../contexts/index'
import '../styles/EstimateGas.css'

import translate from '../utils/language'

function EstimateGas({ blockPrices }) {
  const { language } = useContext(AppContext)

  return (
    <div id="main-content">
      <div className="main">
        {blockPrices && (
          <div className="gas_list" key={0}>
            {blockPrices?.estimatedPrices?.map((gas, index) => {
              if (index > 2) return null
              return (
                <div className={`gas_block${index} gas_block `} key={index}>
                  <p>{translate(language, 'priority_fee')}</p>
                  <p className="priority_fee">{gas.maxPriorityFeePerGas}</p>
                  <p>{translate(language, 'max_fee')}</p>
                  <p className="max_fee">{gas.maxFeePerGas}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EstimateGas
