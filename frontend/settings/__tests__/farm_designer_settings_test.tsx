jest.mock("../../farm_designer/map/layers/farmbot/bot_trail", () => ({
  resetVirtualTrail: jest.fn(),
}));

jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { PlainDesignerSettings, Setting } from "../farm_designer_settings";
import { DesignerSettingsPropsBase, SettingProps } from "../interfaces";
import { resetVirtualTrail } from "../../farm_designer/map/layers/farmbot/bot_trail";
import { BooleanSetting } from "../../session_keys";
import { DeviceSetting } from "../../constants";
import { setWebAppConfigValue } from "../../config_storage/actions";

describe("<PlainDesignerSettings />", () => {
  const fakeProps = (): DesignerSettingsPropsBase => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.text().toLowerCase()).toContain("plant animations");
  });

  it("doesn't call callback", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.find("label").at(0).text()).toContain("animations");
    wrapper.find("button").at(0).simulate("click");
    expect(resetVirtualTrail).not.toHaveBeenCalled();
  });

  it("calls callback", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.find("label").at(1).text()).toContain("trail");
    wrapper.find("button").at(1).simulate("click");
    expect(resetVirtualTrail).toHaveBeenCalled();
  });
});

describe("<Setting />", () => {
  const fakeProps = (): SettingProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    setting: BooleanSetting.show_farmbot,
    title: DeviceSetting.showFarmbot,
    description: "description",
    confirm: "confirmation message",
  });

  it("toggles upon confirmation", () => {
    window.confirm = jest.fn(() => true);
    const wrapper = mount(<Setting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_farmbot, true);
  });

  it("doesn't toggle upon cancel", () => {
    window.confirm = jest.fn(() => false);
    const wrapper = mount(<Setting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValue).not.toHaveBeenCalled();
  });
});
