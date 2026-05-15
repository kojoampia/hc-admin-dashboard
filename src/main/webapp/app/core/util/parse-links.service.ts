import { Injectable } from '@angular/core';

/**
 * An utility service for link parsing.
 */
@Injectable({
  providedIn: 'root',
})
export class ParseLinks {
  /**
   * Method to parse the links
   */
  parse(header: string): { [key: string]: number } {
    const sections = this.parseSections(header);
    const links: { [key: string]: number } = {};

    sections.forEach(({ queryString, name }) => {
      if (queryString.page !== undefined) {
        links[name] = parseInt(queryString.page, 10);
      }
    });

    return links;
  }

  parseAll(header: string): Record<string, Record<string, string | undefined>> {
    const sections = this.parseSections(header);
    const links: Record<string, Record<string, string | undefined>> = {};

    sections.forEach(({ queryString, name }) => {
      links[name] = queryString;
    });

    return links;
  }

  private parseSections(header: string): Array<{ name: string; queryString: Record<string, string | undefined> }> {
    if (header.length === 0) {
      throw new Error('input must not be of zero length');
    }

    // Split parts by comma
    const parts: string[] = header.split(',');
    const sections: Array<{ name: string; queryString: Record<string, string | undefined> }> = [];

    // Parse each part into a named link
    parts.forEach(p => {
      const section: string[] = p.split(';');

      if (section.length !== 2) {
        throw new Error('section could not be split on ";"');
      }

      const url: string = section[0].replace(/<(.*)>/, '$1').trim(); // NOSONAR
      const queryString: Record<string, string | undefined> = {};

      url.replace(/([^?=&]+)(=([^&]*))?/g, (_$0: string, $1: string | undefined, _$2: string | undefined, $3: string | undefined) => {
        if ($1 !== undefined) {
          queryString[$1] = $3;
        }
        return $3 ?? '';
      });

      const name: string = section[1].replace(/rel="(.*)"/, '$1').trim();
      sections.push({ name, queryString });
    });

    return sections;
  }
}
