import React from 'react';
import PropTypes from 'prop-types';

import Anchor from 'antd/lib/anchor';

export class StepConnector extends React.PureComponent {
  static propTypes = {
    nonLinear: PropTypes.object,
    height: PropTypes.number,
    steps: PropTypes.array,
    completed: PropTypes.bool,
    activeStep: PropTypes.number
  };

  constructor(props) {
    super(props);

    const firstStep = props.steps[0] || {};
    this.state = {
      activeStep: 0,
      activeTab: firstStep.tab
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.activeStep !== undefined && this.props.activeStep !== prevState.activeStep) {
      this.handleStep(this.props.activeStep, this.props.steps[this.props.activeStep].tab);
    }
  }

  handleStep = (activeStep, activeTab) => {
    this.props.steps.forEach(step => {
      const dom = step.getContainer ? step.getContainer(step.id) : document.getElementById(step.id);
      if (step.tab === activeTab) {
        dom.style.display = 'block';
      } else {
        dom.style.display = 'none';
      }
    });
    this.setState({
      activeStep: activeStep,
      activeTab: activeTab
    });
  }

  render() {
    const activeStep = this.state.activeStep;
    const {steps} = this.props;

    return (<Anchor affix={false} className="hc-stepConnector">
      {steps.map((step, index) => {
        return [(<div key={index} className="hc-stepConnector-elem-step">
          <button tabIndex={index} type="button" className="hc-stepConnector-elem-step_btn" onClick={() => this.handleStep(index, step.tab)}>
            <div>
              <span className={'hc-stepConnector-elem-step_span' + (activeStep === index ? ' active' : '')}>
                <span>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <text x="12" y="16">{index + 1}</text>
                  </svg>
                </span>
                <Anchor.Link href={'#' + step.id} title={step.text} />
              </span>
            </div>
          </button>
        </div>),
        steps.length - index > 1 ? (<div className="hc-stepConnector-elem-connector"><span></span></div>) : null
        ];
      })}
    </Anchor>);
  }
}
