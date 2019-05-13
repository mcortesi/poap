import React, { useState, useEffect } from 'react';
import { getEvents, PoapEvent, getEvent, updateEvent } from '../api';
import { useAsync } from '../react-helpers';
import { Link, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import { object, string } from 'yup';
import classNames from 'classnames';

export const EventsPage: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/events" component={EventList} />
      <Route exact path="/admin/events/new" component={CreateEventForm} />
      <Route exact path="/admin/events/:eventId" component={EditEventForm} />
    </Switch>
  );
};

// const IP_REGEXP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ADDRESS_REGEXP = /^0x[0-9a-fA-F]{40}$/;

const PoapEventSchema = object().shape({
  image_url: string()
    .label('Image Url')
    .required()
    .url(),
  event_url: string()
    .label('Website')
    .url(),
  signer_ip: string()
    .label('Signer Url')
    // .url()
    .nullable(),
  signer: string()
    .matches(ADDRESS_REGEXP, 'Must be a valid Ethereum Address')
    .nullable(),
});

const CreateEventForm: React.FC = () => {
  return <>Hola mundo</>;
};

const EditEventForm: React.FC<
  RouteComponentProps<{
    eventId: string;
  }>
> = ({ location, match }) => {
  const [event, setEvent] = useState<null | PoapEvent>(null);

  useEffect(() => {
    const fn = async () => {
      if (location.state) {
        setEvent(location.state);
      } else {
        const event = await getEvent(match.params.eventId);
        if (event) {
          if (event.signer == null) {
            event.signer = '';
          }
          if (event.signer_ip == null) {
            event.signer_ip = '';
          }
        }
        setEvent(event);
      }
    };
    fn();
  }, [location, match]);

  if (!event) {
    return <div>Loading...</div>;
  }

  console.log(event);
  return (
    <Formik
      initialValues={event}
      validationSchema={PoapEventSchema}
      onSubmit={async (values, actions) => {
        try {
          actions.setSubmitting(true);
          await updateEvent(values);
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form>
          <h2>
            {event.name} - {event.year}
          </h2>

          <EventField disabled title="Fancy ID" name="fancy_id" />
          <EventField disabled title="Description" name="description" />
          <div className="bk-group">
            <EventField disabled title="Start Date" name="start_date" />
            <EventField disabled title="End Date" name="end_date" />
          </div>
          <div className="bk-group">
            <EventField disabled title="City" name="city" />
            <EventField disabled title="Country" name="country" />
          </div>
          <EventField title="Website" name="event_url" />
          <EventField title="Image Url" name="image_url" />
          <EventField title="Signer Url" name="signer_ip" />
          <EventField title="Signer Address" name="signer" />

          <SubmitButton isSubmitting={isSubmitting} canSubmit={dirty && isValid} />
        </Form>
      )}
    </Formik>
  );
};

const SubmitButton: React.FC<{ isSubmitting: boolean; canSubmit: boolean }> = ({
  isSubmitting,
  canSubmit,
}) => (
  <button
    className={classNames('btn', isSubmitting && 'loading')}
    type="submit"
    disabled={isSubmitting || !canSubmit}
  >
    {isSubmitting ? '' : 'Save'}
  </button>
);

type EventFieldProps = {
  title: string;
  name: string;
  disabled?: boolean;
};
const EventField: React.FC<EventFieldProps> = ({ title, name, disabled }) => {
  return (
    <Field
      name={name}
      render={({ field, form }: FieldProps) => (
        <div className="bk-form-row">
          <label>{title}:</label>
          <input
            type="text"
            {...field}
            disabled={disabled}
            className={classNames(!!form.errors[name] && 'error')}
          />
          <ErrorMessage name={name} component="p" className="bk-error" />
        </div>
      )}
    />
  );
};

const EventList: React.FC = () => {
  const [events, fetchingEvents, fetchEventsError] = useAsync(getEvents);

  return (
    <>
      <h2>Events</h2>
      <button className="bk-btn" style={{ margin: '30px 0px' }}>
        Create New
      </button>
      {fetchingEvents ? (
        <div>Fetching Events...</div>
      ) : fetchEventsError || events == null ? (
        <div>There was a problem fetching events</div>
      ) : (
        <div>
          {events.map(e => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </>
  );
};

const EventRow: React.FC<{ event: PoapEvent }> = ({ event }) => {
  return (
    <div className="bk-eventrow">
      <div>{event.name}</div>
      <div>
        <Link to={{ pathname: `/admin/events/${event.fancy_id}`, state: event }}>
          <button className="bk-btn">Edit</button>
        </Link>
      </div>
    </div>
  );
};
