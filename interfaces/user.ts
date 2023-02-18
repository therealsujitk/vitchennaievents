import axios, { AxiosInstance } from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { JSDOM } from 'jsdom';
import { CookieJar } from 'tough-cookie';
import { ClientError } from '../api/utils/errors';
import { BASE_PATH } from '../config';
import UserModal from '../models/user';

export default class User {

  static async #getInstance(user: UserModal) : Promise<AxiosInstance> {
    const cookieJar = new CookieJar();
    const instance = axios.create({
      baseURL: `https://vitchennaievents.com/${BASE_PATH}`,
      httpAgent: new HttpCookieAgent({
        cookies: { jar: cookieJar }
      }),
      httpsAgent: new HttpsCookieAgent({
        cookies: { jar: cookieJar }
      })
    });

    return new Promise<AxiosInstance>((resolve, reject) => {
      instance.post('/login/', new URLSearchParams({
        'username-login': user.username,
        'password-login': user.password,
        'login-form-button': ''
      }))
        .then((res) => {
          const document = new JSDOM(res.data).window.document;
          const errorModal = document.querySelector('.modal-body');

          if (errorModal) {
            reject(new ClientError(errorModal.textContent?.trim()));
          }

          resolve(instance);
        })
        .catch((_) => reject(new Error('Internal server error.')));
    });
  }

  static async getUser(user: UserModal) {
    const instance = await this.#getInstance(user);

    return new Promise((resolve, reject) => {
      instance.get('/profile/')
        .then((res) => {
          const document = new JSDOM(res.data).window.document;
          const tableRows = document.querySelector('.card2')?.getElementsByTagName('tr');
          const profile: { [x: string]: any } = {};

          for (let i = 0; i < tableRows!.length; ++i) {
            const cell = tableRows![i].textContent?.toLowerCase();

            if (cell?.includes('id')) {
              profile.id = tableRows![++i].textContent?.trim();
            } else if (cell?.includes('name')) {
              profile.name = tableRows![++i].textContent?.trim();
            } else if (cell?.includes('email')) {
              profile.email = tableRows![++i].textContent?.trim();
            } else if (cell?.includes('ph no')) {
              profile.mobile = tableRows![++i].textContent?.trim();
            } else if (cell?.includes('college')) {
              profile.college = tableRows![++i].textContent?.trim();
            }
          }

          resolve(profile);
        })
        .catch((_) => reject(new Error('Internal server error.')));
    });
  }

  static async getEvents(user: UserModal) {
    const instance = await this.#getInstance(user);

    return new Promise((resolve, reject) => {
      instance.get('/profile/')
        .then((res) => {
          const document = new JSDOM(res.data).window.document;
          const categories = document.getElementsByClassName('mai');
          const events = categories[0].getElementsByClassName('modal-body');

          const result = [];

          for (let i = 0; i < events.length; ++i) {
            if (!events[i].getElementsByTagName('table')[0]) {
              continue;
            }

            const metaData = events[i].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('p');
            const title = events[i].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].childNodes[0].textContent?.trim();
            const order_id = parseInt(metaData[metaData.length - 1].textContent?.split(':')[1] ?? '0') || null;
            const location = events[i].getElementsByTagName('tr')[1].getElementsByTagName('td')[0].textContent?.trim();
            const date = events[i].getElementsByTagName('tr')[1].getElementsByTagName('td')[1].textContent?.trim();
            const time = events[i].getElementsByTagName('tr')[1].getElementsByTagName('td')[2].textContent?.trim();
            const is_paid = events[i].getElementsByTagName('tr')[1].getElementsByTagName('td')[3].textContent?.toLowerCase().includes('paid');

            result.push({ title, order_id, location, date, time, is_paid });
          }

          resolve(result);
        })
        .catch((e) => console.log(e))
        .catch((_) => reject(new Error('Internal server error.')));
    });
  }

  static async getMerchandise(user: UserModal) {
    const instance = await this.#getInstance(user);

    return new Promise((resolve, reject) => {
      instance.get('/profile/')
        .then((res) => {
          const document = new JSDOM(res.data).window.document;
          const categories = document.getElementsByClassName('mai');
          const merchandise = categories[1].getElementsByClassName('modal-body');

          const result = [];

          for (let i = 0; i < merchandise.length; ++i) {
            if (!merchandise[i].getElementsByTagName('table')[0]) {
              continue;
            }

            const name = merchandise[i].getElementsByTagName('tr')[0]?.getElementsByTagName('p')[0]?.textContent?.trim();
            const image = new URL(merchandise[i].getElementsByTagName('img')[0]?.src.trim(), 'http://vitchennaievents.com/vibrance/profile/').href;
            const size = merchandise[i].getElementsByTagName('tr')[1]?.getElementsByTagName('td')[0]?.textContent?.trim();
            const quantity = parseFloat(merchandise[i].getElementsByTagName('tr')[1]?.getElementsByTagName('td')[1]?.textContent || '0');
            const status = merchandise[i].getElementsByTagName('tr')[1]?.getElementsByTagName('td')[2]?.textContent?.trim();

            result.push({ name, image, size, quantity, status });
          }

          resolve(result);
        })
        .catch((_) => reject(new Error('Internal server error.')));
    });
  }
}
