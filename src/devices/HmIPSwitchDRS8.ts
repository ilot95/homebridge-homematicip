import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  PlatformAccessory,
  Service,
} from 'homebridge';

import {HmIPPlatform} from '../HmIPPlatform.js';
import {HmIPDevice, HmIPGroup, Updateable} from '../HmIPState.js';
import {HmIPGenericDevice} from './HmIPGenericDevice.js';

interface SwitchChannel {
    functionalChannelType: string;
    on: boolean;
    profileMode: string;
    userDesiredProfileMode: string;
}

/**
 * HomematicIP switch
 *
 * HMIPW-DRS8 (Homematic IP Wired Switch Actuator – 8x channels)
 *
 */
export class HmIPSwitchDRS8 extends HmIPGenericDevice implements Updateable {
  //private service: Service;

  //private on = false;

  constructor(
    platform: HmIPPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.platform.log.debug(`fake Created switch DRS8 ${accessory.context.device.label}`);

    const srv = this.accessory.getService(this.platform.Service.Switch)

    if (srv !== undefined){
      this.accessory.removeService(srv);
      this.platform.log.info(`remove old srv DRS8`);
    }
    /*
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);

    this.updateDevice(accessory.context.device, platform.groups);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.handleOnGet.bind(this))
      .on('set', this.handleOnSet.bind(this));
    */
  }

  /*
  handleOnGet(callback: CharacteristicGetCallback) {
    callback(null, this.on);
  }

  async handleOnSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.info('Setting switch %s to %s', this.accessory.displayName, value ? 'ON' : 'OFF');
    const body = {
      channelIndex: 1,
      deviceId: this.accessory.context.device.id,
      on: value,
    };
    await this.platform.connector.apiCall('device/control/setSwitchState', body);
    callback(null);
  }
  */

  public updateDevice(hmIPDevice: HmIPDevice, groups: { [key: string]: HmIPGroup }) {
    super.updateDevice(hmIPDevice, groups);
    /*
    for (const id in hmIPDevice.functionalChannels) {
      const channel = hmIPDevice.functionalChannels[id];
      if (channel.functionalChannelType === 'SWITCH_CHANNEL') {
        const switchChannel = <SwitchChannel>channel;
        this.platform.log.debug(`Switch update: ${JSON.stringify(channel)}`);

        if (switchChannel.on !== null && switchChannel.on !== this.on) {
          this.on = switchChannel.on;
          this.platform.log.info('Switch state of %s changed to %s', this.accessory.displayName, this.on ? 'ON' : 'OFF');
          this.service.updateCharacteristic(this.platform.Characteristic.On, this.on);
        }
      } 
    }
    */
  }

}
