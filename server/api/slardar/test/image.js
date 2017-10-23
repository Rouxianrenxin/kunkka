module.exports = {
  // name: 'image',
  path: 'glance/image.js',
  test: {
    getImageList: {
      path: '/api/v1/images',
      input: {},
      output: {
        'images': [
          {
            'expected_size': '10',
            'image_state': 'available',
            'image_build_version': '2016-03-28',
            'min_ram': 0,
            'ramdisk_id': null,
            'updated_at': '2016-04-18T03:58:40Z',
            'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
            'owner': 'b484b27774144a8d8d1c2d49bf85370d',
            'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'size': 1073741824,
            'meta_var': 'meta_val',
            'image_version': '0.3.4-64bit',
            'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
            'image_type': 'snapshot',
            'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
            'disk_format': 'raw',
            'id': '577e27c5-5585-4486-900d-d4256eda51c2',
            'image_name_order': '210',
            'protected': false,
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'image_location': 'snapshot',
            'tags': [],
            'kernel_id': null,
            'visibility': 'private',
            'min_disk': 1,
            'virtual_size': null,
            'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
            'name': '龙鹏-server-image',
            'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
            'created_at': '2016-04-18T03:56:51Z',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
            'image_label_order': '100',
            'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'image_label': 'Cirros'
          },
          {
            'expected_size': '10',
            'image_build_version': '2016-03-28',
            'min_ram': 0,
            'updated_at': '2016-03-29T02:40:23Z',
            'file': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'size': 13287936,
            'image_version': '0.3.4-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'disk_format': 'raw',
            'image_name_order': '210',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/c3fbabf3-8a1f-4420-95df-64ca4877d260/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Cirros 0.3.4 64bit',
            'checksum': null,
            'created_at': '2016-03-29T02:40:17Z',
            'protected': false,
            'image_label_order': '100',
            'image_label': 'Cirros'
          },
          {
            'expected_size': '20',
            'image_build_version': '2014-10-09-b',
            'min_ram': 0,
            'updated_at': '2016-03-15T09:07:30Z',
            'file': '/v2/images/ee285be5-2b82-408d-bf3f-2bbc7c04788c/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'ee285be5-2b82-408d-bf3f-2bbc7c04788c',
            'size': 21474836480,
            'image_version': '13.1-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/ee285be5-2b82-408d-bf3f-2bbc7c04788c',
            'disk_format': 'raw',
            'image_name_order': '100',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'ELJq7WPUBTJLxVO\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/ee285be5-2b82-408d-bf3f-2bbc7c04788c/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'OpenSUSE 13.1 64bit',
            'checksum': null,
            'created_at': '2016-03-15T09:01:54Z',
            'protected': false,
            'image_label_order': '250',
            'image_label': 'OpenSUSE'
          },
          {
            'expected_size': '20',
            'image_build_version': '2014-12-30-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T08:31:14Z',
            'file': '/v2/images/d28d2a53-7c99-4c30-b07e-67b89c02c092/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'd28d2a53-7c99-4c30-b07e-67b89c02c092',
            'size': 21474836480,
            'image_version': '7.6-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/d28d2a53-7c99-4c30-b07e-67b89c02c092',
            'disk_format': 'raw',
            'image_name_order': '200',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'YIlrfdXL\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/d28d2a53-7c99-4c30-b07e-67b89c02c092/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Debian 7.6 64bit',
            'checksum': null,
            'created_at': '2016-03-15T08:28:10Z',
            'protected': false,
            'image_label_order': '150',
            'image_label': 'Debian'
          },
          {
            'expected_size': '20',
            'image_build_version': '2015-06-12-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T07:44:17Z',
            'file': '/v2/images/bd5c3a06-4585-4c1f-9a2b-97d175cd456c/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'bd5c3a06-4585-4c1f-9a2b-97d175cd456c',
            'size': 21474836480,
            'image_version': '22-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/bd5c3a06-4585-4c1f-9a2b-97d175cd456c',
            'disk_format': 'raw',
            'image_name_order': '400',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'0Eknkr2b1X\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/bd5c3a06-4585-4c1f-9a2b-97d175cd456c/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Fedora 22 64bit',
            'checksum': null,
            'created_at': '2016-03-15T07:40:49Z',
            'protected': false,
            'image_label_order': '300',
            'image_label': 'Fedora'
          },
          {
            'expected_size': '20',
            'image_build_version': '2016-02-24-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T07:13:12Z',
            'file': '/v2/images/897a57a3-36c2-4aac-ae76-ef18e9cc14bf/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': '897a57a3-36c2-4aac-ae76-ef18e9cc14bf',
            'size': 21474836480,
            'image_version': '5.11-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/897a57a3-36c2-4aac-ae76-ef18e9cc14bf',
            'disk_format': 'raw',
            'image_name_order': '050',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'DiuLfwOG\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/897a57a3-36c2-4aac-ae76-ef18e9cc14bf/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'CentOS 5.11 64bit',
            'checksum': null,
            'created_at': '2016-03-15T07:04:34Z',
            'protected': false,
            'image_label_order': '100',
            'image_label': 'CentOS'
          },
          {
            'expected_size': '20',
            'image_build_version': '2016-02-23-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T07:00:50Z',
            'file': '/v2/images/5446dd8e-b058-4503-a3a6-97e2a7c2ed66/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': '5446dd8e-b058-4503-a3a6-97e2a7c2ed66',
            'size': 21474836480,
            'image_version': '5.8-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/5446dd8e-b058-4503-a3a6-97e2a7c2ed66',
            'disk_format': 'raw',
            'image_name_order': '020',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'DiuLfwOG\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/5446dd8e-b058-4503-a3a6-97e2a7c2ed66/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'CentOS 5.8 64bit',
            'checksum': null,
            'created_at': '2016-03-15T06:51:27Z',
            'protected': false,
            'image_label_order': '100',
            'image_label': 'CentOS'
          },
          {
            'expected_size': '6',
            'image_build_version': '2015-06-03-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T06:51:15Z',
            'file': '/v2/images/37e20be3-7638-4c7e-97f3-d6da52ae1519/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': '37e20be3-7638-4c7e-97f3-d6da52ae1519',
            'size': 6442450944,
            'image_version': 'Fedora-Cloud-22-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/37e20be3-7638-4c7e-97f3-d6da52ae1519',
            'disk_format': 'raw',
            'image_name_order': '100',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'0Eknkr2b1X\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/37e20be3-7638-4c7e-97f3-d6da52ae1519/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Fedora Cloud Atomic 22 64bit',
            'checksum': null,
            'created_at': '2016-03-15T06:49:19Z',
            'protected': false,
            'image_label_order': '400',
            'image_label': 'Atomic'
          },
          {
            'expected_size': '20',
            'image_build_version': '2015-03-16-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T06:38:40Z',
            'file': '/v2/images/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': '3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7',
            'size': 21474836480,
            'image_version': '2015.02-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7',
            'disk_format': 'raw',
            'image_name_order': '300',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'OyiDMqpDFSj\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Arch Linux 2015.02 64bit',
            'checksum': null,
            'created_at': '2016-03-15T06:31:26Z',
            'protected': false,
            'image_label_order': '270',
            'image_label': 'Arch'
          },
          {
            'expected_size': '20',
            'image_build_version': '2016-03-03-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T06:39:19Z',
            'file': '/v2/images/a6e979b8-c826-4943-8d20-1d13d55cf775/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'a6e979b8-c826-4943-8d20-1d13d55cf775',
            'size': 21474836480,
            'image_version': '14.04-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/a6e979b8-c826-4943-8d20-1d13d55cf775',
            'disk_format': 'raw',
            'image_name_order': '200',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'TbkZrCiSFd\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/a6e979b8-c826-4943-8d20-1d13d55cf775/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Ubuntu 14.04 64bit',
            'checksum': null,
            'created_at': '2016-03-15T06:13:48Z',
            'protected': false,
            'image_label_order': '200',
            'image_label': 'Ubuntu'
          },
          {
            'expected_size': '20',
            'image_build_version': '2015-04-21-a',
            'min_ram': 0,
            'updated_at': '2016-03-15T06:15:07Z',
            'file': '/v2/images/75f65172-c714-4687-9b30-016742627c50/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': '75f65172-c714-4687-9b30-016742627c50',
            'size': 21474836480,
            'image_version': '6.5-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/75f65172-c714-4687-9b30-016742627c50',
            'disk_format': 'raw',
            'image_name_order': '100',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'UdQGtYlhHj\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/75f65172-c714-4687-9b30-016742627c50/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'CentOS 6.5 64bit',
            'checksum': 'fabb4f9449242c62cbbca0f98937aac4',
            'created_at': '2016-03-11T09:34:14Z',
            'protected': false,
            'image_label_order': '100',
            'image_label': 'CentOS'
          }
        ]
      }
    },
    getImageDetails: {
      path: '/api/v1/images/:imageId',
      input: {},
      output: {
        'image': {
          'expected_size': '10',
          'image_state': 'available',
          'image_build_version': '2016-03-28',
          'min_ram': 0,
          'ramdisk_id': null,
          'updated_at': '2016-04-18T03:58:40Z',
          'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
          'owner': 'b484b27774144a8d8d1c2d49bf85370d',
          'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
          'size': 1073741824,
          'meta_var': 'meta_val',
          'image_version': '0.3.4-64bit',
          'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
          'image_type': 'snapshot',
          'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
          'disk_format': 'raw',
          'id': '577e27c5-5585-4486-900d-d4256eda51c2',
          'image_name_order': '210',
          'protected': false,
          'container_format': 'bare',
          'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
          'schema': '/v2/schemas/image',
          'status': 'active',
          'image_location': 'snapshot',
          'tags': [],
          'kernel_id': null,
          'visibility': 'private',
          'min_disk': 1,
          'virtual_size': null,
          'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
          'name': '龙鹏-server-image',
          'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
          'created_at': '2016-04-18T03:56:51Z',
          'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
          'image_label_order': '100',
          'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'image_label': 'Cirros'
        }
      }
    },
    getInstanceSnapshotList: {
      path: '/api/v1/instanceSnapshots',
      input: {},
      output: {
        'images': [
          {
            'expected_size': '10',
            'image_state': 'available',
            'image_build_version': '2016-03-28',
            'min_ram': 0,
            'ramdisk_id': null,
            'updated_at': '2016-04-18T03:58:40Z',
            'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
            'owner': 'b484b27774144a8d8d1c2d49bf85370d',
            'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'size': 1073741824,
            'meta_var': 'meta_val',
            'image_version': '0.3.4-64bit',
            'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
            'image_type': 'snapshot',
            'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
            'disk_format': 'raw',
            'id': '577e27c5-5585-4486-900d-d4256eda51c2',
            'image_name_order': '210',
            'protected': false,
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'image_location': 'snapshot',
            'tags': [],
            'kernel_id': null,
            'visibility': 'private',
            'min_disk': 1,
            'virtual_size': null,
            'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
            'name': '龙鹏-server-image',
            'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
            'created_at': '2016-04-18T03:56:51Z',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
            'image_label_order': '100',
            'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'image_label': 'Cirros'
          }
        ]
      }
    },
    getInstanceSnapshotDetails: {
      path: '/api/v1/instanceSnapshots/:imageId',
      input: {},
      output: {
        'image': {
          'expected_size': '10',
          'image_state': 'available',
          'image_build_version': '2016-03-28',
          'min_ram': 0,
          'ramdisk_id': null,
          'updated_at': '2016-04-18T03:58:40Z',
          'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
          'owner': 'b484b27774144a8d8d1c2d49bf85370d',
          'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
          'size': 1073741824,
          'meta_var': 'meta_val',
          'image_version': '0.3.4-64bit',
          'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
          'image_type': 'snapshot',
          'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
          'disk_format': 'raw',
          'id': '577e27c5-5585-4486-900d-d4256eda51c2',
          'image_name_order': '210',
          'protected': false,
          'container_format': 'bare',
          'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
          'schema': '/v2/schemas/image',
          'status': 'active',
          'image_location': 'snapshot',
          'tags': [],
          'kernel_id': null,
          'visibility': 'private',
          'min_disk': 1,
          'virtual_size': null,
          'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
          'name': '龙鹏-server-image',
          'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
          'created_at': '2016-04-18T03:56:51Z',
          'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
          'image_label_order': '100',
          'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'image_label': 'Cirros'
        }
      }
    }
  }
};
