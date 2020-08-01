import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { uniq } from "lodash";
import { BotState } from "../devices/interfaces";
import { TaggedSensor, FirmwareHardware, TaggedSensorReading } from "farmbot";
import { SensorState } from "./interfaces";
import { Everything, TimeSettings } from "../interfaces";
import { validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import {
  isFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import {
  selectAllSensors, selectAllSensorReadings, maybeGetTimeSettings,
} from "../resources/selectors";
import { SensorReadings } from "./sensor_readings/sensor_readings";
import { Sensors } from ".";
import { isBotOnlineFromState } from "../devices/must_be_online";

export interface DesignerSensorsProps {
  bot: BotState;
  sensors: TaggedSensor[];
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
  sensorReadings: TaggedSensorReading[];
  timeSettings: TimeSettings;
}

export const mapStateToProps = (props: Everything): DesignerSensorsProps => {
  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig = sourceFbosConfigValue(fbosConfig, configuration);
  const { value } = sourceFbosConfig("firmware_hardware");
  const firmwareHardware = isFwHardwareValue(value) ? value : undefined;
  return {
    dispatch: props.dispatch,
    bot: props.bot,
    sensors: uniq(selectAllSensors(props.resources.index)),
    sensorReadings: selectAllSensorReadings(props.resources.index),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    firmwareHardware,
  };
};

export class RawDesignerSensors
  extends React.Component<DesignerSensorsProps, SensorState> {
  state = { isEditing: false };

  get arduinoBusy() {
    return !!this.props.bot.hardware.informational_settings.busy;
  }

  get botOnline() {
    return isBotOnlineFromState(this.props.bot);
  }

  render() {
    return <DesignerPanel panelName={"sensors"} panel={Panel.Sensors}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"sensors"}>
        <Sensors
          firmwareHardware={this.props.firmwareHardware}
          bot={this.props.bot}
          sensors={this.props.sensors}
          dispatch={this.props.dispatch}
          disabled={this.arduinoBusy || !this.botOnline} />
        <hr />
        <SensorReadings
          sensorReadings={this.props.sensorReadings}
          sensors={this.props.sensors}
          timeSettings={this.props.timeSettings} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSensors = connect(mapStateToProps)(RawDesignerSensors);
