import React, { Component } from 'react';

import {
	Charts,
	ChartContainer,
	ChartRow,
	YAxis,
	LineChart,
	EventMarker,
	Resizable,
	styler,
} from 'react-timeseries-charts';

import CircularProgress from '@material-ui/core/CircularProgress';

const NullMarker = props => {
	return <g />;
};

class MessageTimeSeriesChart extends Component {
	state = {
		trackerValue: null,
		trackerEvent: null,
		tracker: null,
		chart: <CircularProgress />,
	};

	renderMarkers() {
		if (!this.state.tracker) {
			return <NullMarker />;
		}

		return (
			<EventMarker
				type="flag"
				axis="axis"
				event={this.state.trackerEvent}
				column="value"
				info={[{ label: '# Messages', value: String(this.state.trackerValue) }]}
				infoWidth={120}
				// infoStyle={{
				// 	fill: '#fff',
				// 	opacity: 1.0,
				// 	fontSize: '20px',
				// 	color: '#fff',
				// 	stroke: '#fff',
				// 	strokeWidth: '4',
				// 	pointerEvents: 'none',
				// }}
				// markerRadius={2}
				// markerStyle={{ fill: 'black', stroke: 'black', strokeWidth: '4' }}
				// markerLabelStyle={{
				// 	fill: 'black',
				// 	stroke: 'black',
				// 	strokeWidth: '4',
				// 	color: 'black',
				// 	fontSize: '20px',
				// }}
			/>
		);
	}

	handleTrackerChanged = t => {
		if (t) {
			const e = this.props.series.atTime(t);
			const eventTime = new Date(
				e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2
			);
			const eventValue = e.get('value');

			this.setState({
				tracker: eventTime,
				trackerValue: eventValue,
				trackerEvent: e,
			});
		} else {
			this.setState({ tracker: null, trackerValue: null, trackerEvent: null });
		}
	};

	render() {
		let chart = this.state.chart;

		if (this.props.messages && this.props.series) {
			const style = styler([{ key: 'value', color: '#3f51b5', width: 2 }]);

			const yAxisStyles = {
				label: {
					'font-size': 16,
				},
			};

			const seriesTimerange = this.props.series.timerange();

			chart = (
				<Resizable>
					<ChartContainer
						titleStyle={{ fill: '#555', fontWeight: 500 }}
						timeRange={seriesTimerange}
						onTrackerChanged={this.handleTrackerChanged}
					>
						<ChartRow height="300">
							<YAxis
								id="axis"
								label="# messages"
								min={0}
								max={this.props.messages.length}
								style={yAxisStyles} // Default label color fontWeight: 100, fontSize: 12, font: '"Goudy Bookletter 1911", sans-serif"' }
								format=".0f"
							/>
							<Charts>
								<LineChart
									axis="axis"
									series={this.props.series}
									style={style}
									column="value"
								/>
								{this.renderMarkers()}
							</Charts>
						</ChartRow>
					</ChartContainer>
				</Resizable>
			);
		} else {
			chart = this.state.chart;
		}

		return chart;
	}
}

export default MessageTimeSeriesChart;
