import { mapCreatorListItem } from './creator-list-item.mapper';
import { createSeededCreatorFixture } from '../../utils/test/seeded-creator-fixtures.utils';

function run() {
   const input = createSeededCreatorFixture(1);
import { requestContextStorage } from '../../utils/als.utils';
import { logger } from '../../utils/logger.utils';

jest.mock('../../utils/logger.utils', () => ({
   logger: { warn: jest.fn(), error: jest.fn() },
}));

const warnMock = logger.warn as jest.Mock;
const errorMock = logger.error as jest.Mock;

   assert.deepEqual(result, {
      id: 'creator-1',
      name: 'Creator 1',
      avatar: 'https://example.com/avatar-1.png',
      followers: 0,
beforeEach(() => {
   warnMock.mockClear();
   errorMock.mockClear();
});

describe('mapCreatorListItem()', () => {
   it('maps the public creator list item shape', () => {
      const input = {
         id: '1',
         displayName: 'John',
         avatarUrl: null,
         createdAt: new Date('2024-01-02T03:04:05.678Z'),
         updatedAt: new Date('2024-01-03T03:04:05.678Z'),
      } as any;

      const result = mapCreatorListItem(input);

      expect(result).toEqual({
         id: '1',
         name: 'John',
         avatar: null,
         followers: 0,
         createdAt: '2024-01-02T03:04:05.678Z',
         updatedAt: '2024-01-03T03:04:05.678Z',
      });
      expect(warnMock).not.toHaveBeenCalled();
   });

   it('warns when a schema-required creator field is unexpectedly null', () => {
      const input = {
         id: 'creator-1',
         displayName: null,
         avatarUrl: null,
         createdAt: new Date('2024-01-02T03:04:05.678Z'),
         updatedAt: new Date('2024-01-03T03:04:05.678Z'),
      } as any;

      const result = requestContextStorage.run(
         { path: '/api/v1/creators', method: 'GET', requestId: 'req-333' },
         () => mapCreatorListItem(input)
      );

      expect(result).toEqual({
         id: 'creator-1',
         name: null,
         avatar: null,
         followers: 0,
         createdAt: '2024-01-02T03:04:05.678Z',
         updatedAt: '2024-01-03T03:04:05.678Z',
      });
      expect(warnMock).toHaveBeenCalledWith({
         msg: 'Unexpected null creator field in database result',
         fieldName: 'displayName',
         creatorId: 'creator-1',
         requestId: 'req-333',
      });
   });

   it('logs an error when a string field receives an unexpected type', () => {
      const input = {
         id: 'creator-2',
         handle: 'test-handle',
         displayName: 12345, // number instead of string
         avatarUrl: null,
         isVerified: false,
         createdAt: new Date('2024-01-02T03:04:05.678Z'),
         updatedAt: new Date('2024-01-03T03:04:05.678Z'),
      } as any;

      const result = requestContextStorage.run(
         { path: '/api/v1/creators', method: 'GET', requestId: 'req-type-1' },
         () => mapCreatorListItem(input)
      );

      expect(result).toEqual({
         id: 'creator-2',
         name: 12345,
         avatar: null,
         followers: 0,
         createdAt: '2024-01-02T03:04:05.678Z',
         updatedAt: '2024-01-03T03:04:05.678Z',
      });
      expect(errorMock).toHaveBeenCalledWith({
         msg: 'Creator list field type mismatch',
         fieldName: 'displayName',
         expectedType: 'string',
         receivedType: 'number',
         creatorId: 'creator-2',
         requestId: 'req-type-1',
      });
   });

   it('logs an error when a Date field receives a string', () => {
      const input = {
         id: 'creator-3',
         handle: 'test-handle',
         displayName: 'Alice',
         avatarUrl: null,
         isVerified: true,
         createdAt: '2024-01-02T03:04:05.678Z', // string instead of Date
         updatedAt: new Date('2024-01-03T03:04:05.678Z'),
      } as any;

      requestContextStorage.run(
         { path: '/api/v1/creators', method: 'GET', requestId: 'req-type-2' },
         () => mapCreatorListItem(input)
      );

      expect(errorMock).toHaveBeenCalledWith(
         expect.objectContaining({
            msg: 'Creator list field type mismatch',
            fieldName: 'createdAt',
            expectedType: 'Date',
            receivedType: 'string',
            creatorId: 'creator-3',
            requestId: 'req-type-2',
         })
      );
   });

   it('does not log an error for correctly typed fields', () => {
      const input = {
         id: 'creator-4',
         handle: 'good-handle',
         displayName: 'Bob',
         avatarUrl: 'https://example.com/avatar.png',
         isVerified: false,
         createdAt: new Date('2024-01-02T03:04:05.678Z'),
         updatedAt: new Date('2024-01-03T03:04:05.678Z'),
      } as any;

      mapCreatorListItem(input);

      expect(errorMock).not.toHaveBeenCalled();
   });
});
